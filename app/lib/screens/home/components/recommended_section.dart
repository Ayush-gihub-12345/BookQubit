import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';

class RecommendedBookModel {
  final String title;
  final String author;
  final String timeLeft;
  final double? progress;
  final bool isBestseller;
  final VoidCallback? onTap;
  final VoidCallback? onPlay;

  RecommendedBookModel({
    required this.title,
    required this.author,
    required this.timeLeft,
    this.progress,
    this.isBestseller = false,
    this.onTap,
    this.onPlay,
  });
}

class RecommendedSection extends StatelessWidget {
  final List<RecommendedBookModel> books;
  final VoidCallback? onViewAll;

  const RecommendedSection({
    super.key,
    required this.books,
    this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recommended for You',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: onViewAll,
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: books.length,
          itemBuilder: (context, index) {
            final book = books[index];
            return GestureDetector(
              onTap: book.onTap,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
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
                child: Row(
                  children: [
                    Container(
                      width: 70,
                      height: 90,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        gradient: LinearGradient(
                          colors: [
                            AppColors.getSecondary(context),
                            AppColors.getSecondary(context).withOpacity(0.7),
                          ],
                        ),
                      ),
                      child: const Icon(
                        Icons.menu_book,
                        color: Colors.white,
                        size: 35,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              if (book.isBestseller)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.warning,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'Bestseller',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              if (book.isBestseller)
                                const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  book.title,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            book.author,
                            style: TextStyle(
                              color: AppColors.getTextSecondary(context),
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(
                                Icons.access_time,
                                size: 14,
                                color: AppColors.getTextLight(context),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                book.timeLeft,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: AppColors.getTextLight(context),
                                ),
                              ),
                              if (book.progress != null) ...[
                                const SizedBox(width: 12),
                                Icon(
                                  Icons.trending_up,
                                  size: 14,
                                  color: AppColors.success,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${book.progress!.toInt()}% done',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: AppColors.success,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.play_circle_filled,
                        color: AppColors.getPrimary(context),
                      ),
                      onPressed: book.onPlay,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}