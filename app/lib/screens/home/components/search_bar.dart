import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';

class HomeSearchBar extends StatelessWidget {
  final Function(String)? onSearch;
  final VoidCallback? onFilter;

  const HomeSearchBar({
    super.key,
    this.onSearch,
    this.onFilter,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(15),
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
          hintText: 'Search books, authors, or genres...',
          hintStyle: TextStyle(color: AppColors.getTextLight(context)),
          prefixIcon: Icon(Icons.search, color: AppColors.getPrimary(context)),
          suffixIcon: IconButton(
            icon: Icon(Icons.tune, color: AppColors.getTextLight(context)),
            onPressed: onFilter,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.all(16),
        ),
        onChanged: onSearch,
      ),
    );
  }
}