import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DataProvider extends ChangeNotifier {
  List<dynamic> incomes = [];
  List<dynamic> expenses = [];
  List<dynamic> budgets = [];
  List<dynamic> goals = [];
  Map<String, dynamic> summary = {};
  Map<String, dynamic> appSettings = {
    'enabled_periods': ['monthly', 'quarterly', 'semi-annually', 'yearly'],
    'enabled_years': [2024, 2025, 2026],
    'income_categories': ['Maaş', 'Ek Gelir', 'Kira Geliri', 'Yatırım'],
    'expense_categories': ['Market', 'Fatura', 'Kira', 'Eğitim', 'Sağlık', 'Diğer'],
    'currency': '₺'
  };
  bool isLoading = false;

  int selectedYear = DateTime.now().year;
  String selectedPeriod = 'monthly';

  final Map<String, String> periodLabels = {
    'monthly': 'Aylık',
    'quarterly': '3 Aylık',
    'semi-annually': '6 Aylık',
    'yearly': 'Yıllık',
  };

  String get currentPeriodLabel => periodLabels[selectedPeriod] ?? selectedPeriod;

  List<Map<String, String>> get availablePeriods {
    final List<Map<String, String>> all = [
      {'id': 'monthly', 'label': 'Aylık'},
      {'id': 'quarterly', 'label': '3 Aylık'},
      {'id': 'semi-annually', 'label': '6 Aylık'},
      {'id': 'yearly', 'label': 'Yıllık'},
    ];
    final enabled = (appSettings['enabled_periods'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];
    return all.where((p) => enabled.contains(p['id'])).toList();
  }

  void updateFilter({int? year, String? period}) {
    if (year != null) selectedYear = year;
    if (period != null) selectedPeriod = period;
    notifyListeners();
    refresh();
  }

  Future<void> refresh() async {
    isLoading = true;
    notifyListeners();
    try {
      final results = await Future.wait([
        ApiService.getIncomes(selectedYear, selectedPeriod),
        ApiService.getExpenses(selectedYear, selectedPeriod),
        ApiService.getBudgets(),
        ApiService.getGoals(),
        ApiService.getSummary(selectedYear, selectedPeriod),
        ApiService.getSettings(),
      ]);
      incomes = results[0] as List<dynamic>;
      expenses = results[1] as List<dynamic>;
      budgets = results[2] as List<dynamic>;
      goals = results[3] as List<dynamic>;
      summary = results[4] as Map<String, dynamic>;
      appSettings = results[5] as Map<String, dynamic>;

      // Validate selected year and period
      final enabledYears = (appSettings['enabled_years'] as List<dynamic>?)?.map((e) => int.parse(e.toString())).toList() ?? [];
      if (enabledYears.isNotEmpty && !enabledYears.contains(selectedYear)) {
        selectedYear = enabledYears.reduce((a, b) => a > b ? a : b); // default to max
      }

      final enabled = (appSettings['enabled_periods'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];
      if (enabled.isNotEmpty && !enabled.contains(selectedPeriod)) {
        selectedPeriod = enabled.first;
      }
    } catch (e) {
      debugPrint('Veri yüklenirken hata: $e');
    }
    isLoading = false;
    notifyListeners();
  }

  Future<void> updateAppSettings(Map<String, dynamic> updates) async {
    try {
      final newSettings = await ApiService.updateSettings({...appSettings, ...updates});
      appSettings = newSettings;
      notifyListeners();
    } catch (e) {
      debugPrint('Ayarlar kaydedilirken hata: $e');
      rethrow;
    }
  }

  Future<void> addIncome(Map<String, dynamic> body) async {
    await ApiService.addIncome(body);
    await refresh();
  }

  Future<void> deleteIncome(int id) async {
    await ApiService.deleteIncome(id);
    incomes.removeWhere((i) => i['id'] == id);
    notifyListeners();
  }

  Future<void> addExpense(Map<String, dynamic> body) async {
    await ApiService.addExpense(body);
    await refresh();
  }

  Future<void> deleteExpense(int id) async {
    await ApiService.deleteExpense(id);
    expenses.removeWhere((i) => i['id'] == id);
    notifyListeners();
  }

  Future<void> addBudget(Map<String, dynamic> body) async {
    await ApiService.addBudget(body);
    await refresh();
  }

  Future<void> addGoal(Map<String, dynamic> body) async {
    await ApiService.addGoal(body);
    await refresh();
  }
}
