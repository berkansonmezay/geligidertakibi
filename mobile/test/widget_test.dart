import 'package:flutter_test/flutter_test.dart';
import 'package:family_budget_mobile/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const AileBudgetApp());
    expect(find.byType(AileBudgetApp), findsOneWidget);
  });
}
