import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';

void main() {
  ErrorWidget.builder = (_) => const SizedBox.shrink();

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    showErrorBanner(details.exceptionAsString());
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    showErrorBanner(error.toString());
    return true;
  };

  runApp(
    const ProviderScope(
      child: FurnigoApp(),
    ),
  );
}

void showErrorBanner(String message) {
  final display = message.split('\n').first;
  WidgetsBinding.instance.addPostFrameCallback((_) {
    errorNotifier.value = display;
  });
}
