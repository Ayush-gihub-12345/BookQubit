import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Search Bar
            Container(
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search books, authors, genres...',
                  prefixIcon: const Icon(Icons.search),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.all(16),
                ),
                onChanged: (value) {},
              ),
            ),
            const SizedBox(height: 20),
            
            // Recent Searches
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Recent Searches',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: [
                _buildRecentSearchChip(context, 'Harry Potter'),
                _buildRecentSearchChip(context, 'Stephen King'),
                _buildRecentSearchChip(context, 'Science Fiction'),
                _buildRecentSearchChip(context, 'Psychology'),
              ],
            ),
            const SizedBox(height: 24),
            
            // Popular Genres
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Popular Genres',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ),
            const SizedBox(height: 12),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.5,
              children: [
                _buildGenreCard('Fiction', Icons.auto_stories, AppColors.primary),
                _buildGenreCard('Mystery', Icons.search, AppColors.secondary),
                _buildGenreCard('Romance', Icons.favorite, Colors.pink),
                _buildGenreCard('Sci-Fi', Icons.science, Colors.cyan),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildRecentSearchChip(BuildContext context, String label) {
    return Chip(
      label: Text(label),
      avatar: const Icon(Icons.history, size: 16),
      onDeleted: () {},
      deleteIcon: const Icon(Icons.close, size: 14),
      backgroundColor: Theme.of(context).cardColor,
    );
  }
  
  Widget _buildGenreCard(String genre, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 8),
          Text(genre, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}