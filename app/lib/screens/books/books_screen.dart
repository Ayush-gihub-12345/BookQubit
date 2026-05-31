import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/constants/colors.dart';
import 'models/book_model.dart';
import 'book_card.dart';
import 'book_detail_screen.dart';  // Add this import
import 'services/image_service.dart';

class BooksScreen extends StatefulWidget {
  const BooksScreen({super.key});

  @override
  State<BooksScreen> createState() => _BooksScreenState();
}

class _BooksScreenState extends State<BooksScreen> {
  List<BookModel> _allBooks = [];
  List<BookModel> _filteredBooks = [];
  String _selectedCategory = 'All';
  String _searchQuery = '';
  bool _isLoading = true;
  
  final Set<String> _categories = {'All'};

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await ImageService.loadImages();
    await _loadBooks();
  }

  Future<void> _loadBooks() async {
    try {
      // Load book data from JSON file
      final String jsonString = await rootBundle.loadString('lib/screens/books/data/book_data.json');
      final List<dynamic> jsonList = json.decode(jsonString);
      
      setState(() {
        _allBooks = jsonList.map((json) => BookModel.fromJson(json)).toList();
        _filteredBooks = _allBooks;
        
        // Extract unique categories from books
        for (var book in _allBooks) {
          if (book.category.isNotEmpty) {
            _categories.add(book.category);
          }
        }
        _isLoading = false;
      });
      
      print('Loaded ${_allBooks.length} books');
    } catch (e) {
      print('Error loading books: $e');
      setState(() {
        _isLoading = false;
      });
      
      // Show error message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading books: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _filterBooks() {
    setState(() {
      _filteredBooks = _allBooks.where((book) {
        // Filter by category
        if (_selectedCategory != 'All' && book.category != _selectedCategory) {
          return false;
        }
        
        // Filter by search query
        if (_searchQuery.isNotEmpty) {
          return book.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                 book.author.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                 book.category.toLowerCase().contains(_searchQuery.toLowerCase());
        }
        
        return true;
      }).toList();
    });
  }

  void _onCategorySelected(String category) {
    setState(() {
      _selectedCategory = category;
    });
    _filterBooks();
  }

  void _onSearch(String query) {
    setState(() {
      _searchQuery = query;
    });
    _filterBooks();
  }

  void _clearSearch() {
    setState(() {
      _searchQuery = '';
    });
    _filterBooks();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Books',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              _showSearchDialog();
            },
            tooltip: 'Search Books',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : _allBooks.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.menu_book_outlined,
                        size: 80,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No Books Available',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Check back later for new books',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Category Chips
                    Container(
                      height: 50,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _categories.length,
                        itemBuilder: (context, index) {
                          final category = _categories.elementAt(index);
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(category),
                              selected: _selectedCategory == category,
                              onSelected: (selected) {
                                _onCategorySelected(selected ? category : 'All');
                              },
                              selectedColor: AppColors.primary,
                              checkmarkColor: Colors.white,
                              backgroundColor: Theme.of(context).cardColor,
                              labelStyle: TextStyle(
                                color: _selectedCategory == category 
                                    ? Colors.white 
                                    : AppColors.textSecondary,
                                fontWeight: _selectedCategory == category 
                                    ? FontWeight.w600 
                                    : FontWeight.normal,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    
                    // Book Count and Clear Search
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${_filteredBooks.length} Books Found',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          if (_searchQuery.isNotEmpty)
                            GestureDetector(
                              onTap: _clearSearch,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.clear, size: 16, color: AppColors.primary),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Clear Search',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    
                    // Books Grid
                    Expanded(
                      child: _filteredBooks.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.search_off,
                                    size: 80,
                                    color: Colors.grey.shade400,
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No books found',
                                    style: TextStyle(
                                      fontSize: 18,
                                      color: Colors.grey.shade600,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Try a different category or search term',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey.shade500,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : GridView.builder(
                              padding: const EdgeInsets.all(16),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.7,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                              ),
                              itemCount: _filteredBooks.length,
                              itemBuilder: (context, index) {
                                final book = _filteredBooks[index];
                                return BookCard(
                                  book: book,
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => BookDetailScreen(book: book),
                                      ),
                                    );
                                  },
                                );
                              },
                            ),
                    ),
                  ],
                ),
    );
  }

  void _showSearchDialog() {
    String tempSearch = '';
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text(
            'Search Books',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          content: TextField(
            autofocus: true,
            decoration: const InputDecoration(
              hintText: 'Search by title or author...',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(10)),
              ),
            ),
            onChanged: (value) {
              tempSearch = value;
            },
            onSubmitted: (value) {
              _onSearch(value);
              Navigator.pop(context);
            },
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                _onSearch(tempSearch);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              child: const Text('Search'),
            ),
          ],
        );
      },
    );
  }
}