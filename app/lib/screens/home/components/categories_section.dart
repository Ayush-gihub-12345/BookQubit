import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';

class CategoryModel {
  final String name;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  CategoryModel({
    required this.name,
    required this.icon,
    required this.color,
    this.onTap,
  });
}

class CategoriesSection extends StatelessWidget {
  final List<CategoryModel> categories;
  final VoidCallback? onSeeAll;

  const CategoriesSection({
    super.key,
    required this.categories,
    this.onSeeAll,
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
              'Browse Categories',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: onSeeAll,
              child: const Text('See All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final category = categories[index];
              return GestureDetector(
                onTap: category.onTap,
                child: Container(
                  width: 80,
                  margin: const EdgeInsets.only(right: 12),
                  child: Column(
                    children: [
                      Container(
                        height: 60,
                        width: 60,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              category.color,
                              category.color.withOpacity(0.7),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Icon(
                          category.icon,
                          color: Colors.white,
                          size: 30,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        category.name,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.getTextSecondary(context),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}