class Env {
  static const apiBaseUrl = String.fromEnvironment(
    'FURNIGO_API_BASE_URL',
    defaultValue: 'http://localhost:9411/v1',
  );

  static const wsUrl = String.fromEnvironment(
    'FURNIGO_WS_URL',
    defaultValue: 'http://localhost:9411',
  );
}
