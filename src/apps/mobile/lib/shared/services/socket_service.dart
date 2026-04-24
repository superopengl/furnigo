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

  SocketService(this._authStore);

  io.Socket? get socket => _socket;

  Future<void> connect() async {
    final token = await _authStore.getToken();
    if (token == null) return;

    _socket = io.io(
      Env.wsUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setPath('/ws')
          .setAuth({'token': token})
          .disableAutoConnect()
          .build(),
    );

    _socket!.connect();
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

  void onNewMessage(void Function(dynamic data) callback) {
    _socket?.on('message:new', callback);
  }

  void onTyping(void Function(dynamic data) callback) {
    _socket?.on('typing', callback);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
