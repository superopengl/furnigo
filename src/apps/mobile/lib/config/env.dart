import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  static String get baseUrl => dotenv.env['FURNIGO_BASE_URL'] ?? 'http://localhost:9411';
  static String get apiPath => dotenv.env['FURNIGO_API_PATH'] ?? '/api';
  static String get wsUrl => dotenv.env['FURNIGO_WS_URL'] ?? 'http://localhost:9411';
  
  // Combined API base URL
  static String get apiBaseUrl => '${baseUrl}${apiPath}';
}
