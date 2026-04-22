class Env {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/v1',
  );

  static const wsUrl = String.fromEnvironment(
    'WS_URL',
    defaultValue: 'http://localhost:3000',
  );
}
