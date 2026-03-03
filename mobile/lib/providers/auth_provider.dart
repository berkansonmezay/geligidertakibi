import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await ApiService.login(email, password);
      _user = data['user'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', data['token']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('DioException', '').trim();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await ApiService.register(name, email, password);
      _user = data['user'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', data['token']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('DioException', '').trim();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final token = await ApiService.getToken();
    if (token != null) {
      // We have a token, mark as "logged in" provisionally
      _user = {'name': 'Kullanıcı', 'email': '', 'role': 'member'};
      notifyListeners();
    }
  }
}
