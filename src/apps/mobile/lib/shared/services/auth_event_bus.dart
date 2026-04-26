import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AuthEvent { tokenRefreshed, authLost }

class AuthEventBus {
  final _controller = StreamController<AuthEvent>.broadcast();

  Stream<AuthEvent> get stream => _controller.stream;

  void emit(AuthEvent event) {
    _controller.add(event);
  }

  void dispose() {
    _controller.close();
  }
}

final authEventBusProvider = Provider<AuthEventBus>((ref) {
  final bus = AuthEventBus();
  ref.onDispose(bus.dispose);
  return bus;
});
