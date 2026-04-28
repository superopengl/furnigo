import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  const env = String.fromEnvironment('ENV', defaultValue: 'dev');
  await dotenv.load(fileName: env == 'prod' ? '.env.prod' : '.env');

  final googleClientId = dotenv.env['FURNIGO_GOOGLE_CLIENT_ID'];
  if (googleClientId != null && googleClientId.isNotEmpty) {
    await GoogleSignIn.instance.initialize(
      clientId: Platform.isIOS ? googleClientId : null,
      serverClientId: Platform.isAndroid ? googleClientId : null,
    );
  }

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
