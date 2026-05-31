import 'package:flutter/material.dart';

class AuthProvider extends ChangeNotifier {
  bool _isLoggedIn = false;
  String? _userEmail;
  String? _userName;

  bool get isLoggedIn => _isLoggedIn;
  String? get userEmail => _userEmail;
  String? get userName => _userName;

  Future<bool> login(String email, String password) async {
    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));
    
    _isLoggedIn = true;
    _userEmail = email;
    _userName = email.split('@')[0];
    notifyListeners();
    return true;
  }

  Future<bool> signup(String name, String email, String password) async {
    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));
    
    _isLoggedIn = true;
    _userEmail = email;
    _userName = name;
    notifyListeners();
    return true;
  }

  void logout() {
    _isLoggedIn = false;
    _userEmail = null;
    _userName = null;
    notifyListeners();
  }

  void skipLogin() {
    _isLoggedIn = false;
    _userEmail = null;
    _userName = null;
    notifyListeners();
  }
}