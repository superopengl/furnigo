import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../providers/auth_store.dart';
import '../../config/env.dart';

final socketServiceProvider = Provider<SocketService>((ref) {
  return SocketService(ref.read(authStoreProvider));
});

class SocketService {
  final AuthStore _authStore;
  io.Socket? _socket;

  /// Broadcast streams that survive socket reconnections.
  final _messageController = StreamController<dynamic>.broadcast();
  final _typingController = StreamController<dynamic>.broadcast();

  Stream<dynamic> get onMessage => _messageController.stream;
  Stream<dynamic> get onTyping => _typingController.stream;

  SocketService(this._authStore);

  io.Socket? get socket => _socket;

  Future<void> connect() async {
    final token = await _authStore.getToken();
    if (token == null) return;

    _socket?.disconnect();
    _socket = io.io(
      Env.wsUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setPath('/ws')
          .setAuth({'token': token})
          .disableAutoConnect()
          .enableForceNew()
          .build(),
    );

    _socket!.on('message:new', (data) => _messageController.add(data));
    _socket!.on('typing', (data) => _typingController.add(data));
    _socket!.connect();
  }

  /// Reconnect with a fresh token (e.g. after token refresh).
  Future<void> reconnect() async {
    disconnect();
    await connect();
  }

  void joinChat(String chatId) {
    _socket?.emit('join', chatId);
  }

  void leaveChat(String chatId) {
    _socket?.emit('leave', chatId);
  }

  void sendTyping(String chatId) {
    _socket?.emit('typing', {'chatId': chatId});
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
