import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

const String baseUrl = 'http://localhost:3001';

class ApiService {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // --- Auth ---
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    return res.data;
  }

  static Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final res = await _dio.post('/auth/register', data: {'name': name, 'email': email, 'password': password});
    return res.data;
  }

  // --- Incomes ---
  static Future<List<dynamic>> getIncomes(int year, String period) async {
    final h = await _headers();
    final res = await _dio.get('/api/incomes', queryParameters: {'year': year, 'period': period}, options: Options(headers: h));
    return res.data;
  }

  static Future<Map<String, dynamic>> addIncome(Map<String, dynamic> body) async {
    final h = await _headers();
    final res = await _dio.post('/api/incomes', data: body, options: Options(headers: h));
    return res.data;
  }

  static Future<void> deleteIncome(int id) async {
    final h = await _headers();
    await _dio.delete('/api/incomes/$id', options: Options(headers: h));
  }

  // --- Expenses ---
  static Future<List<dynamic>> getExpenses(int year, String period) async {
    final h = await _headers();
    final res = await _dio.get('/api/expenses', queryParameters: {'year': year, 'period': period}, options: Options(headers: h));
    return res.data;
  }

  static Future<Map<String, dynamic>> addExpense(Map<String, dynamic> body) async {
    final h = await _headers();
    final res = await _dio.post('/api/expenses', data: body, options: Options(headers: h));
    return res.data;
  }

  static Future<void> deleteExpense(int id) async {
    final h = await _headers();
    await _dio.delete('/api/expenses/$id', options: Options(headers: h));
  }

  // --- Budgets ---
  static Future<List<dynamic>> getBudgets() async {
    final h = await _headers();
    final res = await _dio.get('/api/budgets', options: Options(headers: h));
    return res.data;
  }

  static Future<Map<String, dynamic>> addBudget(Map<String, dynamic> body) async {
    final h = await _headers();
    final res = await _dio.post('/api/budgets', data: body, options: Options(headers: h));
    return res.data;
  }

  // --- Goals ---
  static Future<List<dynamic>> getGoals() async {
    final h = await _headers();
    final res = await _dio.get('/api/budgets/goals', options: Options(headers: h));
    return res.data;
  }

  static Future<Map<String, dynamic>> addGoal(Map<String, dynamic> body) async {
    final h = await _headers();
    final res = await _dio.post('/api/budgets/goals', data: body, options: Options(headers: h));
    return res.data;
  }

  // --- Reports ---
  static Future<Map<String, dynamic>> getSummary(int year, String period) async {
    final h = await _headers();
    final res = await _dio.get('/api/reports/summary', queryParameters: {'year': year, 'period': period}, options: Options(headers: h));
    return res.data;
  }

  // --- Settings ---
  static Future<Map<String, dynamic>> getSettings() async {
    final h = await _headers();
    final res = await _dio.get('/api/settings', options: Options(headers: h));
    return res.data;
  }

  static Future<Map<String, dynamic>> updateSettings(Map<String, dynamic> body) async {
    final h = await _headers();
    final res = await _dio.put('/api/settings', data: body, options: Options(headers: h));
    return res.data;
  }
}
