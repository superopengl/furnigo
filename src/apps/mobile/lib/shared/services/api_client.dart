import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_store.dart';
import '../../config/env.dart';

final apiClientProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: '${Env.baseUrl}${Env.apiPath}',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  final authStore = ref.read(authStoreProvider);

  // Separate Dio instance for refresh calls to avoid interceptor recursion
  final refreshDio = Dio(BaseOptions(
    baseUrl: '${Env.baseUrl}${Env.apiPath}',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  Completer<String?>? _refreshCompleter;

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await authStore.getToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(options);
    },
    onError: (error, handler) async {
      if (error.response?.statusCode != 401) {
        return handler.next(error);
      }

      // If deactivated (403), don't attempt refresh
      final errorCode = error.response?.data?['error']?['code'];
      if (errorCode == 'USER_DEACTIVATED') {
        await authStore.clear();
        return handler.next(error);
      }

      final token = await authStore.getToken();
      if (token == null) {
        return handler.next(error);
      }

      // Serialize concurrent refresh attempts
      if (_refreshCompleter != null) {
        final newToken = await _refreshCompleter!.future;
        if (newToken != null) {
          error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
          final res = await dio.fetch(error.requestOptions);
          return handler.resolve(res);
        }
        return handler.next(error);
      }

      _refreshCompleter = Completer<String?>();

      try {
        final res = await refreshDio.post(
          '/auth/token/refresh',
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        );

        final newToken = res.data['data']['token'] as String;
        await authStore.save(token: newToken, userId: (await authStore.getUserId())!);
        _refreshCompleter!.complete(newToken);

        // Retry the original request
        error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final retryRes = await dio.fetch(error.requestOptions);
        return handler.resolve(retryRes);
      } on DioException catch (e) {
        _refreshCompleter!.complete(null);
        // Refresh failed — clear auth state
        final code = e.response?.data?['error']?['code'];
        if (code == 'TOKEN_EXPIRED' || code == 'USER_DEACTIVATED') {
          await authStore.clear();
        }
        return handler.next(error);
      } finally {
        _refreshCompleter = null;
      }
    },
  ));

  return dio;
});
