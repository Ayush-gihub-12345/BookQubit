import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../constants/colors.dart';

class ThemeSwitcher extends StatelessWidget {
  const ThemeSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    
    return PopupMenuButton<ThemeMode>(
      icon: Icon(
        themeProvider.isDarkMode ? Icons.dark_mode : Icons.light_mode,
        color: AppColors.getTextPrimary(context),
      ),
      onSelected: (ThemeMode mode) {
        themeProvider.setThemeMode(mode);
      },
      itemBuilder: (BuildContext context) => [
        const PopupMenuItem(
          value: ThemeMode.light,
          child: Row(
            children: [
              Icon(Icons.light_mode),
              SizedBox(width: 12),
              Text('Light Mode'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: ThemeMode.dark,
          child: Row(
            children: [
              Icon(Icons.dark_mode),
              SizedBox(width: 12),
              Text('Dark Mode'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: ThemeMode.system,
          child: Row(
            children: [
              Icon(Icons.settings),
              SizedBox(width: 12),
              Text('System Default'),
            ],
          ),
        ),
      ],
    );
  }
}