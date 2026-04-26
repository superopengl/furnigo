import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_store.dart';
import 'auth_event_bus.dart';
import '../../config/env.dart';

final apiClientProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: '${Env.baseUrl}${Env.apiPath}',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  final authStore = ref.read(authStoreProvider);
  final authEventBus = ref.read(authEventBusProvider);

  // Separate Dio instance for refresh calls to avoid interceptor recursion
  final refreshDio = Dio(BaseOptions(
    baseUrl: '${Env.baseUrl}${Env.apiPath}',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  Completer<String?>? refreshCompleter;

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

      // If deactivated, don't attempt refresh
      final errorCode = error.response?.data?['error']?['code'];
      if (errorCode == 'USER_DEACTIVATED') {
        await authStore.clear();
        authEventBus.emit(AuthEvent.authLost);
        return handler.next(error);
      }

      final token = await authStore.getToken();
      if (token == null) {
        return handler.next(error);
      }

      // Serialize concurrent refresh attempts
      if (refreshCompleter != null) {
        final newToken = await refreshCompleter!.future;
        if (newToken != null) {
          error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
          final res = await refreshDio.fetch(error.requestOptions);
          return handler.resolve(res);
        }
        return handler.next(error);
      }

      refreshCompleter = Completer<String?>();

      try {
        final res = await refreshDio.post(
          '/auth/token/refresh',
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        );

        final newToken = res.data['data']['token'] as String;
        await authStore.save(token: newToken, userId: (await authStore.getUserId())!);
        refreshCompleter!.complete(newToken);
        authEventBus.emit(AuthEvent.tokenRefreshed);

        // Retry the original request with the refresh Dio to avoid re-entering interceptors
        error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final retryRes = await refreshDio.fetch(error.requestOptions);
        return handler.resolve(retryRes);
      } on DioException catch (e) {
        refreshCompleter!.complete(null);
        // Refresh failed — clear auth state and notify
        final code = e.response?.data?['error']?['code'];
        if (code == 'TOKEN_EXPIRED' || code == 'USER_DEACTIVATED') {
          await authStore.clear();
          authEventBus.emit(AuthEvent.authLost);
        }
        return handler.next(error);
      } finally {
        refreshCompleter = null;
      }
    },
  ));

  return dio;
});
