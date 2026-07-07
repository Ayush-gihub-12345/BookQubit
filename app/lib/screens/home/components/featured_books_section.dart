import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';
import '../../../services/book_service.dart';
import '../../books/models/book_model.dart';
import '../../books/services/image_service.dart';
import '../../books/book_detail_screen.dart';

class FeaturedBooksSection extends StatefulWidget {
  final VoidCallback? onViewAll;

  const FeaturedBooksSection({
    super.key,
    this.onViewAll,
  });

  @override
  State<FeaturedBooksSection> createState() => _FeaturedBooksSectionState();
}

class _FeaturedBooksSectionState extends State<FeaturedBooksSection> {
  List<BookModel> _featuredBooks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFeaturedBooks();
  }

  Future<void> _loadFeaturedBooks() async {
    await ImageService.loadImages();
    final books = await BookService.getFeaturedBooks();
    setState(() {
      _featuredBooks = books;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Featured Books',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: widget.onViewAll,
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        
        if (_isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32.0),
              child: CircularProgressIndicator(),
            ),
          )
        else if (_featuredBooks.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32.0),
              child: Text('No featured books available'),
            ),
          )
        else
          SizedBox(
            height: 280,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _featuredBooks.length,
              itemBuilder: (context, index) {
                final book = _featuredBooks[index];
                return _buildBookCard(context, book);
              },
            ),
          ),
      ],
    );
  }

  Widget _buildBookCard(BuildContext context, BookModel book) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => BookDetailScreen(book: book),
          ),
        );
      },
      child: Container(
        width: 160,
        margin: const EdgeInsets.only(right: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Book Cover
            Container(
              height: 160,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  ImageService.getImageUrl(book.imageKey),
                  fit: BoxFit.cover,
                  width: double.infinity,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primary,
                            AppColors.primary.withOpacity(0.5),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.auto_stories,
                          size: 50,
                          color: Colors.white,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 8),
            
            // Book Title
            Text(
              book.title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            
            // Author
            Text(
              book.author,
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            
            // Rating and Price
            Row(
              children: [
                const Icon(Icons.star, size: 14, color: Colors.amber),
                const SizedBox(width: 4),
                Text(
                  book.rating.toString(),
                  style: const TextStyle(fontSize: 12),
                ),
                const Spacer(),
                Text(
                  book.price,
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            
            // Category
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                book.category,
                style: TextStyle(
                  fontSize: 10,
                  color: AppColors.primary,
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}