import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/services/api_client.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiClientProvider));
});

class AuthService {
  final Dio _dio;

  AuthService(this._dio);

  Future<Map<String, dynamic>> sendOtp(String email) async {
    final res = await _dio.post('/auth/otp/send', data: {'email': email});
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyOtp(String otpId, String code) async {
    final res = await _dio.post('/auth/otp/verify', data: {
      'otp_id': otpId,
      'code': code,
    });
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMe() async {
    final res = await _dio.get('/users/me');
    return res.data['data'] as Map<String, dynamic>;
  }
}
