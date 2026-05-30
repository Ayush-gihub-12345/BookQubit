import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import 'components/welcome_section.dart';
import 'components/search_bar.dart';
import 'components/categories_section.dart';
import 'components/featured_books_section.dart';
import 'components/recommended_section.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Component 1: Welcome Section
            WelcomeSection(
              userName: 'Book Lover',
              streakDays: 7,
              currentBook: 'The Midnight Library',
              progress: 0.45,
              onContinue: () {
                // Handle continue reading
              },
            ),
            const SizedBox(height: 20),

            // Component 2: Search Bar
            HomeSearchBar(
              onSearch: (query) {
                // Handle search
              },
              onFilter: () {
                // Handle filter
              },
            ),
            const SizedBox(height: 20),

            // Component 3: Categories Section
            CategoriesSection(
              categories: [
                CategoryModel(
                  name: 'Fiction',
                  icon: Icons.auto_stories,
                  color: Colors.blue,
                  onTap: () {},
                ),
                CategoryModel(
                  name: 'Mystery',
                  icon: Icons.search,
                  color: Colors.purple,
                  onTap: () {},
                ),
                CategoryModel(
                  name: 'Romance',
                  icon: Icons.favorite,
                  color: Colors.red,
                  onTap: () {},
                ),
                CategoryModel(
                  name: 'Sci-Fi',
                  icon: Icons.science,
                  color: Colors.green,
                  onTap: () {},
                ),
                CategoryModel(
                  name: 'History',
                  icon: Icons.history,
                  color: Colors.orange,
                  onTap: () {},
                ),
              ],
              onSeeAll: () {
                // Handle see all categories
              },
            ),
            const SizedBox(height: 24),

            // Component 4: Featured Books Section (Now using JSON data)
            FeaturedBooksSection(
              onViewAll: () {
                // Navigate to all books
                Navigator.pushNamed(context, '/books');
              },
            ),
            const SizedBox(height: 24),

            // Component 5: Recommended Section
            RecommendedSection(
              books: [
                RecommendedBookModel(
                  title: 'The Silent Patient',
                  author: 'Alex Michaelides',
                  timeLeft: '8 hrs left',
                  progress: null,
                  isBestseller: false,
                  onTap: () {},
                  onPlay: () {},
                ),
                RecommendedBookModel(
                  title: 'Dune',
                  author: 'Frank Herbert',
                  timeLeft: '12 hrs left',
                  progress: 30,
                  isBestseller: false,
                  onTap: () {},
                  onPlay: () {},
                ),
                RecommendedBookModel(
                  title: 'Project Hail Mary',
                  author: 'Andy Weir',
                  timeLeft: '10 hrs left',
                  progress: null,
                  isBestseller: true,
                  onTap: () {},
                  onPlay: () {},
                ),
              ],
              onViewAll: () {
                // Handle view all recommendations
              },
            ),
          ],
        ),
      ),
    );
  }
}