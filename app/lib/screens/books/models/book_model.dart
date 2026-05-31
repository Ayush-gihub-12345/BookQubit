class BookModel {
  final int id;
  final String title;
  final String originaltitle;
  final String slug;
  final String author;
  final String collection;
  final String description;
  final String category;
  final String genre;
  final String nominations;
  final String price;
  final String imageKey;
  final double rating;
  final Map<String, dynamic> geography;
  final List<String> keyPoints;
  final List<String> tags;
  final String isbn;
  final int pageCount;
  final String published;
  final String originalPublished;
  final String format;
  final String publisher;
  final String language;
  final List<String> genres;
  final List<String> subjects;
  final String summary;
  final Map<String, dynamic> buttons;
  final List<dynamic>? otherEditions;

  BookModel({
    required this.id,
    required this.title,
    required this.originaltitle,
    required this.slug,
    required this.author,
    required this.collection,
    required this.description,
    required this.category,
    required this.genre,
    required this.nominations,
    required this.price,
    required this.imageKey,
    required this.rating,
    required this.geography,
    required this.keyPoints,
    required this.tags,
    required this.isbn,
    required this.pageCount,
    required this.published,
    required this.originalPublished,
    required this.format,
    required this.publisher,
    required this.language,
    required this.genres,
    required this.subjects,
    required this.summary,
    required this.buttons,
    this.otherEditions,
  });

  factory BookModel.fromJson(Map<String, dynamic> json) {
    return BookModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      originaltitle: json['originaltitle'] ?? '',
      slug: json['slug'] ?? '',
      author: json['author'] ?? '',
      collection: json['collection'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      genre: json['genre'] ?? '',
      nominations: json['nominations'] ?? '',
      price: json['price'] ?? '',
      imageKey: json['imageKey'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      geography: json['geography'] ?? {},
      keyPoints: List<String>.from(json['keyPoints'] ?? []),
      tags: List<String>.from(json['tags'] ?? []),
      isbn: json['isbn'] ?? '',
      pageCount: json['pageCount'] ?? 0,
      published: json['published'] ?? '',
      originalPublished: json['originalPublished'] ?? '',
      format: json['format'] ?? '',
      publisher: json['publisher'] ?? '',
      language: json['language'] ?? '',
      genres: List<String>.from(json['genres'] ?? []),
      subjects: List<String>.from(json['subjects'] ?? []),
      summary: json['summary'] ?? '',
      buttons: json['buttons'] ?? {},
      otherEditions: json['otherEditions'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'originaltitle': originaltitle,
      'slug': slug,
      'author': author,
      'collection': collection,
      'description': description,
      'category': category,
      'genre': genre,
      'nominations': nominations,
      'price': price,
      'imageKey': imageKey,
      'rating': rating,
      'geography': geography,
      'keyPoints': keyPoints,
      'tags': tags,
      'isbn': isbn,
      'pageCount': pageCount,
      'published': published,
      'originalPublished': originalPublished,
      'format': format,
      'publisher': publisher,
      'language': language,
      'genres': genres,
      'subjects': subjects,
      'summary': summary,
      'buttons': buttons,
      'otherEditions': otherEditions,
    };
  }
}