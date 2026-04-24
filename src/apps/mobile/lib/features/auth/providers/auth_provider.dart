import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/providers/auth_store.dart';
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

  AuthNotifier(this._authService, this._authStore, this._socketService)
      : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final token = await _authStore.getToken();
    if (token != null) {
      state = state.copyWith(status: AuthStatus.authenticated);
      await _socketService.connect();
    } else {
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
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(authServiceProvider),
    ref.read(authStoreProvider),
    ref.read(socketServiceProvider),
  );
});
