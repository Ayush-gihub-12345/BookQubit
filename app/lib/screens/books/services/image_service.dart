import 'dart:convert';
import 'package:flutter/services.dart';

class ImageService {
  static Map<String, String>? _imageMap;
  
  static Future<void> loadImages() async {
    try {
      final String jsonString = await rootBundle.loadString('lib/screens/books/data/book_image_data.json');
      final Map<String, dynamic> jsonMap = json.decode(jsonString);
      
      _imageMap = jsonMap.map((key, value) => MapEntry(key, value.toString()));
      print('Loaded ${_imageMap?.length} book images');
    } catch (e) {
      print('Error loading images: $e');
      _imageMap = {};
    }
  }
  
  static String getImageUrl(String imageKey) {
    if (_imageMap == null) {
      return 'https://via.placeholder.com/300x400?text=Book+Cover';
    }
    
    return _imageMap![imageKey] ?? 'https://via.placeholder.com/300x400?text=No+Image';
  }
}