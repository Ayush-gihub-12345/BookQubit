import 'package:flutter/material.dart';

class LogoWidget extends StatelessWidget {
  final double size;
  final bool showText;
  final double textSize;
  
  const LogoWidget({
    super.key,
    this.size = 80,
    this.showText = true,
    this.textSize = 24,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Logo - use fallback if asset not found
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 10,
              ),
            ],
          ),
          child: ClipOval(
            child: Image.asset(
              'assets/logo/bookqubitlogo1.png',
              width: size,
              height: size,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return const Icon(
                  Icons.auto_stories,
                  size: 40,
                  color: Color(0xFF5E2EFF),
                );
              },
            ),
          ),
        ),
        if (showText) ...[
          const SizedBox(height: 16),
          Text(
            'BookQubit',
            style: TextStyle(
              fontSize: textSize,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your Digital Library',
            style: TextStyle(
              fontSize: textSize * 0.5,
              color: Colors.white.withOpacity(0.9),
              letterSpacing: 1,
            ),
          ),
        ],
      ],
    );
  }
}