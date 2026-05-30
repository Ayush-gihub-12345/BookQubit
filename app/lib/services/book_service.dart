import 'dart:convert';
import 'package:flutter/services.dart';
import '../screens/books/models/book_model.dart';

class BookService {
  static List<BookModel>? _allBooks;
  
  static Future<List<BookModel>> getBooks() async {
    if (_allBooks != null) return _allBooks!;
    
    try {
      final String jsonString = await rootBundle.loadString('lib/screens/books/data/book_data.json');
      final List<dynamic> jsonList = json.decode(jsonString);
      
      _allBooks = jsonList.map((json) => BookModel.fromJson(json)).toList();
      return _allBooks!;
    } catch (e) {
      print('Error loading books: $e');
      return [];
    }
  }
  
  static Future<List<BookModel>> getFeaturedBooks() async {
    final books = await getBooks();
    // Return first 5 books as featured or books with rating >= 4.8
    return books.where((book) => book.rating >= 4.7).take(5).toList();
  }
  
  static Future<List<BookModel>> getBooksByCategory(String category) async {
    final books = await getBooks();
    return books.where((book) => book.category == category).toList();
  }
  
  static Future<BookModel?> getBookById(int id) async {
    final books = await getBooks();
    try {
      return books.firstWhere((book) => book.id == id);
    } catch (e) {
      return null;
    }
  }
}