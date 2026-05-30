import books from "../data/books.data";

// Infer Book type from books array
type Book = typeof books[number];

export class BooksService {
  private repository = books;

  getAllBooks(): Book[] {
    return this.repository;
  }

  getBookById(id: number): Book | undefined {
    return this.repository.find(book => book.id === id);
  }

  getBookBySlug(slug: string): Book | undefined {
    return this.repository.find(book => book.slug === slug);
  }
}

export default new BooksService();
