import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:furnigo/app.dart';

void main() {
  testWidgets('App renders', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: FurnigoApp()),
    );
    // App should render and show login or chats screen
    await tester.pumpAndSettle();
    expect(find.byType(FurnigoApp), findsOneWidget);
  });
}
