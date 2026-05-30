import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Library'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Reading'),
              Tab(text: 'Want to Read'),
              Tab(text: 'Finished'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildBookList(progress: 'reading'),
            _buildBookList(progress: 'want'),
            _buildBookList(progress: 'finished'),
          ],
        ),
      ),
    );
  }
  
  Widget _buildBookList({required String progress}) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: progress == 'reading' ? 2 : (progress == 'want' ? 3 : 1),
      itemBuilder: (context, index) => _buildBookItem(context, progress), // Pass context here
    );
  }
  
  Widget _buildBookItem(BuildContext context, String progress) { // Add context parameter
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor, // Now context is available
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 70,
            height: 90,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              gradient: AppColors.primaryGradient,
            ),
            child: const Icon(Icons.book, color: Colors.white, size: 35),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'The Great Adventure',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 4),
                Text('By John Doe', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                const SizedBox(height: 8),
                if (progress == 'reading')
                  Column(
                    children: [
                      Row(
                        children: [
                          const Text('Progress: 45%', style: TextStyle(fontSize: 12)),
                          const Spacer(),
                          Text('Page 78/200', style: TextStyle(color: AppColors.textLight, fontSize: 12)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: 0.45,
                        backgroundColor: AppColors.textLight.withOpacity(0.2),
                        color: AppColors.primary,
                      ),
                    ],
                  ),
                if (progress == 'finished')
                  Row(
                    children: [
                      const Icon(Icons.check_circle, color: AppColors.success, size: 16),
                      const SizedBox(width: 4),
                      Text('Completed', style: TextStyle(color: AppColors.success, fontSize: 12)),
                    ],
                  ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}