import 'package:flutter/material.dart';
import '../../core/widgets/custom_navbar.dart';
import '../../core/widgets/custom_drawer.dart';
import '../../core/widgets/theme_switcher.dart';
import '../home/home_screen.dart';
import '../books/books_screen.dart';
import '../search/search_screen.dart';
import '../library/library_screen.dart';
import '../profile/profile_screen.dart';

class RootScreen extends StatefulWidget {
  const RootScreen({super.key});
  
  @override
  State<RootScreen> createState() => RootScreenState();
}

class RootScreenState extends State<RootScreen> {
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  
  final List<Widget> _screens = [
    const HomeScreen(),
    const SearchScreen(),
    const LibraryScreen(),
    const ProfileScreen(),
  ];
  
  void onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }
  
  void onDrawerItemTapped(int index) {
    // Close drawer
    Navigator.pop(context);
    
    switch (index) {
      case 0: // Home
        setState(() {
          _selectedIndex = 0;
        });
        break;
      case 1: // Books
        // Navigate to Books screen as a new page (it will have its own app bar)
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const BooksScreen()),
        );
        break;
      case 2: // Comics
        _showComingSoon();
        break;
      case 3: // Authors
        _showComingSoon();
        break;
      case 4: // Publications
        _showComingSoon();
        break;
      default:
        break;
    }
  }
  
  void _showComingSoon() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Coming Soon!'),
        duration: Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () {
            _scaffoldKey.currentState?.openDrawer();
          },
        ),
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/logo/bookqubitlogo1.png',
                  width: 32,
                  height: 32,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return const Icon(
                      Icons.auto_stories, 
                      size: 20, 
                      color: Color(0xFF5E2EFF)
                    );
                  },
                ),
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              'BookQubit',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        centerTitle: false,
        actions: [
          const ThemeSwitcher(),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.login),
            onPressed: () {
              _showLoginDialog();
            },
          ),
        ],
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: CustomNavBar(
        currentIndex: _selectedIndex,
        onTap: onItemTapped,
      ),
      drawer: CustomDrawer(onNavigate: onDrawerItemTapped),
    );
  }
  
  void _showLoginDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Login'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const TextField(
                decoration: InputDecoration(
                  hintText: 'Email',
                  prefixIcon: Icon(Icons.email),
                ),
              ),
              const SizedBox(height: 10),
              const TextField(
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Password',
                  prefixIcon: Icon(Icons.lock),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Login successful!')),
                );
              },
              child: const Text('Login'),
            ),
          ],
        );
      },
    );
  }
}