import 'dart:io' show Platform;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  static String get baseUrl => _fixLocalhost(dotenv.env['FURNIGO_BASE_URL'] ?? 'http://localhost:9411');
  static String get apiPath => dotenv.env['FURNIGO_API_PATH'] ?? '/api';
  static String get wsUrl => _fixLocalhost(dotenv.env['FURNIGO_WS_URL'] ?? 'http://localhost:9411');

  // Combined API base URL
  static String get apiBaseUrl => '${baseUrl}${apiPath}';

  /// Android emulator uses 10.0.2.2 to reach the host machine's localhost.
  static String _fixLocalhost(String url) {
    if (Platform.isAndroid) {
      return url.replaceFirst('localhost', '10.0.2.2');
    }
    return url;
  }
}
