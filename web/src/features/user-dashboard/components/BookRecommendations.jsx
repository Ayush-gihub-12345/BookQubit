"use client";

import "./BookRecommendations.css";

export default function BookRecommendations() {
  const books = [
    "Atomic Habits",
    "Deep Work",
    "The Psychology of Money",
    "Clean Code",
  ];

  return (
    <div className="book-recommendations">
      <h3>Recommended Books</h3>

      {books.map((book) => (
        <div
          key={book}
          className="book-item"
        >
          {book}
        </div>
      ))}
    </div>
  );
}