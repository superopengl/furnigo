import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  static String get baseUrl => dotenv.env['FURNIGO_BASE_URL'] ?? 'http://192.168.86.210:9411';
  static String get apiPath => dotenv.env['FURNIGO_API_PATH'] ?? '/api';
  static String get wsUrl => dotenv.env['FURNIGO_WS_URL'] ?? 'http://192.168.86.210:9411';

  // Combined API base URL
  static String get apiBaseUrl => '$baseUrl$apiPath';

  /// Rewrite localhost URLs in server responses so they resolve on physical
  /// devices. Replaces `localhost:<port>` with the host from [baseUrl].
  static String resolveUrl(String url) {
    if (!url.contains('localhost')) return url;
    final baseUri = Uri.parse(baseUrl);
    return url.replaceFirst('localhost', baseUri.host);
  }
}
