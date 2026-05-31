import books from "../data/books.data";

// Define Book type inline if needed
type Book = typeof books[number];

export class BooksRepository {
  private data: Book[] = books;

  findAll(): Book[] {
    return this.data;
  }

  findById(id: number): Book | undefined {
    return this.data.find(book => book.id === id);
  }

  findBySlug(slug: string): Book | undefined {
    return this.data.find(book => book.slug === slug);
  }

  create(book: Book): Book {
    this.data.push(book);
    return book;
  }

  update(id: number, updated: Partial<Book>): Book | undefined {
    const index = this.data.findIndex(b => b.id === id);
    if (index === -1) return undefined;

    this.data[index] = { ...this.data[index], ...updated };
    return this.data[index];
  }

  delete(id: number): boolean {
    const index = this.data.findIndex(b => b.id === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    return true;
  }
}

export default new BooksRepository();
