import 'package:flutter/material.dart';

class AppColors {
  // Light Theme Colors
  static const Color lightPrimary = Color(0xFF5E2EFF);
  static const Color lightPrimaryLight = Color(0xFF8B5EFF);
  static const Color lightPrimaryDark = Color(0xFF3B1EB3);
  static const Color lightSecondary = Color(0xFFFF6B35);
  static const Color lightSecondaryLight = Color(0xFFFF8F64);
  static const Color lightSecondaryDark = Color(0xFFCC4A1A);
  static const Color lightBackground = Color(0xFFF9F9F9);
  static const Color lightSurface = Colors.white;
  static const Color lightTextPrimary = Color(0xFF1F2937);
  static const Color lightTextSecondary = Color(0xFF6B7280);
  static const Color lightTextLight = Color(0xFF9CA3AF);
  
  // Dark Theme Colors
  static const Color darkPrimary = Color(0xFF7C3AED);
  static const Color darkPrimaryLight = Color(0xFF9B5EFF);
  static const Color darkPrimaryDark = Color(0xFF5B21B6);
  static const Color darkSecondary = Color(0xFFFF8F64);
  static const Color darkSecondaryLight = Color(0xFFFFA98C);
  static const Color darkSecondaryDark = Color(0xFFE05A2A);
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkTextPrimary = Color(0xFFF1F5F9);
  static const Color darkTextSecondary = Color(0xFF94A3B8);
  static const Color darkTextLight = Color(0xFF64748B);
  
  // Common Colors (keep these for backward compatibility)
  static const Color primary = Color(0xFF5E2EFF);
  static const Color primaryLight = Color(0xFF8B5EFF);
  static const Color primaryDark = Color(0xFF3B1EB3);
  static const Color secondary = Color(0xFFFF6B35);
  static const Color secondaryLight = Color(0xFFFF8F64);
  static const Color secondaryDark = Color(0xFFCC4A1A);
  static const Color background = Color(0xFFF9F9F9);
  static const Color surface = Colors.white;
  static const Color darkBackgroundColor = Color(0xFF1A1A2E);
  static const Color darkSurfaceColor = Color(0xFF16213E);
  static const Color textPrimary = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textLight = Color(0xFF9CA3AF);
  static const Color textDark = Colors.white;
  
  // Status colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
  
  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondary, secondaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Dynamic getters based on theme
  static Color getPrimary(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark 
        ? darkPrimary 
        : lightPrimary;
  }
  
  static Color getSecondary(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark 
        ? darkSecondary 
        : lightSecondary;
  }
  
  static Color getBackground(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark 
        ? darkBackground 
        : lightBackground;
  }
  
  static Color getSurface(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark 
        ? darkSurface 
        : lightSurface;
  }
  
  static Color getTextPrimary(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark 
        ? darkTextPrimary 
        : lightTextPrimary;
  }
  
  static Color getTextSecondary(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark 
        ? darkTextSecondary 
        : lightTextSecondary;
  }
  
  static Color getTextLight(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark 
        ? darkTextLight 
        : lightTextLight;
  }
}