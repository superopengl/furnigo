import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/providers/auth_store.dart';
import '../../../shared/services/auth_event_bus.dart';
import '../../../shared/services/message_cache.dart';
import '../../../shared/services/socket_service.dart';
import '../services/auth_service.dart';

enum AuthStatus { unknown, unauthenticated, authenticated }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? error;

  const AuthState({
    this.status = AuthStatus.unknown,
    this.user,
    this.error,
  });

  AuthState copyWith({AuthStatus? status, UserModel? user, String? error}) =>
      AuthState(
        status: status ?? this.status,
        user: user ?? this.user,
        error: error,
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final AuthStore _authStore;
  final SocketService _socketService;
  final MessageCache _messageCache;
  StreamSubscription<AuthEvent>? _authEventSub;

  AuthNotifier(
    this._authService,
    this._authStore,
    this._socketService,
    this._messageCache,
    AuthEventBus authEventBus,
  ) : super(const AuthState()) {
    _authEventSub = authEventBus.stream.listen(_onAuthEvent);
    _init();
  }

  void _onAuthEvent(AuthEvent event) {
    switch (event) {
      case AuthEvent.authLost:
        _handleAuthLost();
      case AuthEvent.tokenRefreshed:
        _socketService.reconnect();
    }
  }

  void _handleAuthLost() {
    if (state.status == AuthStatus.unauthenticated) return;
    _socketService.disconnect();
    _messageCache.clearAll();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  Future<void> _init() async {
    final token = await _authStore.getToken();
    if (token == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }

    // Verify session by calling /users/me.
    // If the token is expired, the Dio interceptor will transparently
    // refresh it before this call returns.
    try {
      final data = await _authService.getMe();
      final user = UserModel.fromJson(data);
      state = state.copyWith(status: AuthStatus.authenticated, user: user);
      await _socketService.connect();
    } catch (_) {
      // Token invalid and refresh also failed — force re-login.
      await _authStore.clear();
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<String> sendOtp(String email) async {
    final data = await _authService.sendOtp(email);
    return data['otp_id'] as String;
  }

  Future<void> verifyOtp(String otpId, String code) async {
    try {
      final data = await _authService.verifyOtp(otpId, code);
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
      final token = data['token'] as String;

      await _authStore.save(token: token, userId: user.id);
      await _socketService.connect();

      state = state.copyWith(status: AuthStatus.authenticated, user: user);
    } catch (e) {
      state = state.copyWith(error: 'Invalid OTP. Please try again.');
    }
  }

  Future<void> logout() async {
    _socketService.disconnect();
    await _authStore.clear();
    await _messageCache.clearAll();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  @override
  void dispose() {
    _authEventSub?.cancel();
    super.dispose();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(authServiceProvider),
    ref.read(authStoreProvider),
    ref.read(socketServiceProvider),
    ref.read(messageCacheProvider),
    ref.read(authEventBusProvider),
  );
});
