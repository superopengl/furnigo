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

  Future<Map<String, dynamic>> verifyOtp(String email, String code) async {
    final res = await _dio.post('/auth/otp/verify', data: {
      'email': email,
      'code': code,
    });
    return res.data['data'] as Map<String, dynamic>;
  }
}
