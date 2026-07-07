import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';

class CustomDrawer extends StatelessWidget {
  final Function(int) onNavigate;

  const CustomDrawer({
    super.key,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // Header
          Container(
            height: 220,
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 45,
                  backgroundColor: Colors.white,
                  child: Icon(
                    Icons.menu_book_rounded,
                    size: 50,
                    color: AppColors.primary,
                  ),
                ),

                SizedBox(height: 15),

                Text(
                  'BookQubit',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),

                SizedBox(height: 6),

                Text(
                  'Read • Learn • Explore',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),

          // Main Pages
          _buildTile(
            context,
            icon: Icons.home_rounded,
            title: 'Home',
            index: 0,
          ),

          _buildTile(
            context,
            icon: Icons.menu_book_rounded,
            title: 'Books',
            index: 1,
          ),

          _buildTile(
            context,
            icon: Icons.auto_stories_rounded,
            title: 'Comics',
            index: 2,
          ),

          _buildTile(
            context,
            icon: Icons.person_rounded,
            title: 'Authors',
            index: 3,
          ),

          _buildTile(
            context,
            icon: Icons.business_rounded,
            title: 'Publications',
            index: 4,
          ),

          const Divider(),

          ListTile(
            leading: const Icon(
              Icons.info_outline_rounded,
              color: AppColors.primary,
            ),
            title: const Text('About'),
            onTap: () {
              Navigator.pop(context);

              showAboutDialog(
                context: context,
                applicationName: 'BookQubit',
                applicationVersion: '1.0.0',
                applicationIcon: const Icon(
                  Icons.menu_book_rounded,
                  size: 40,
                  color: AppColors.primary,
                ),
                children: const [
                  Padding(
                    padding: EdgeInsets.only(top: 12),
                    child: Text(
                      'BookQubit is a modern reading platform for books, comics, authors, and publications.',
                    ),
                  ),
                ],
              );
            },
          ),

          const Divider(),

          ListTile(
            leading: const Icon(
              Icons.logout_rounded,
              color: AppColors.error,
            ),
            title: const Text(
              'Logout',
              style: TextStyle(
                color: AppColors.error,
              ),
            ),
            onTap: () {
              Navigator.pop(context);
              _showLogoutDialog(context);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required int index,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: AppColors.primary,
      ),
      title: Text(title),
      onTap: () {
        Navigator.pop(context);
        onNavigate(index);
      },
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Logout'),
          content: const Text(
            'Are you sure you want to logout?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancel'),
            ),

            TextButton(
              style: TextButton.styleFrom(
                foregroundColor: AppColors.error,
              ),
              onPressed: () {
                Navigator.pop(context);

                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Logged out successfully'),
                  ),
                );
              },
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }
}