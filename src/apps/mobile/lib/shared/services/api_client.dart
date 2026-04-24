import 'dart:developer' as developer;
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_store.dart';
import '../../config/env.dart';

final apiClientProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await ref.read(authStoreProvider).getToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      developer.log('→ ${options.method} ${options.path}', name: 'API');
      handler.next(options);
    },
    onResponse: (response, handler) {
      developer.log('← ${response.statusCode} ${response.requestOptions.method} ${response.requestOptions.path}', name: 'API');
      handler.next(response);
    },
    onError: (error, handler) {
      developer.log('← ${error.response?.statusCode ?? 'ERR'} ${error.requestOptions.method} ${error.requestOptions.path}', name: 'API');
      handler.next(error);
    },
  ));

  return dio;
});
