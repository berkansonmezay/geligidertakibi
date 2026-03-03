import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/data_provider.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/incomes_screen.dart';
import 'screens/expenses_screen.dart';
import 'screens/budgets_screen.dart';
import 'screens/settings_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DataProvider()),
      ],
      child: const AileBudgetApp(),
    ),
  );
}

class AileBudgetApp extends StatelessWidget {
  const AileBudgetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aile Bütçesi',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4F46E5)),
        fontFamily: 'sans-serif',
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF3F4F6),
      ),
      home: const _AppGate(),
      routes: {
        '/login': (_) => const LoginScreen(),
        '/dashboard': (_) => const DashboardScreen(),
        '/incomes': (_) => const IncomesScreen(),
        '/expenses': (_) => const ExpensesScreen(),
        '/budgets': (_) => const BudgetsScreen(),
        '/settings': (_) => const SettingsScreen(),
      },
    );
  }
}

class _AppGate extends StatefulWidget {
  const _AppGate();
  @override
  State<_AppGate> createState() => _AppGateState();
}

class _AppGateState extends State<_AppGate> {
  bool _checking = true;

  @override
  void initState() {
    super.initState();
    _checkLogin();
  }

  Future<void> _checkLogin() async {
    await context.read<AuthProvider>().tryAutoLogin();
    setState(() => _checking = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_checking) return const Scaffold(body: Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5))));
    final auth = context.watch<AuthProvider>();
    return auth.isLoggedIn ? const DashboardScreen() : const LoginScreen();
  }
}
