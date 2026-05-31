// src/api/v1/modules/books/controller/books.controller.ts

import { Request, Response } from "express";
import service from "../services/books.service";
import { createBookSchema, updateBookSchema } from "../validations/books.validation";

export class BooksController {

  getAll = (req: Request, res: Response) => {
    const books = service.getAllBooks();
    res.json(books);
  };

  getById = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const book = service.getBookById(id);

    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  };

  getBySlug = (req: Request, res: Response) => {
    const { slug } = req.params;
    const book = service.getBookBySlug(slug);

    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  };

  create = (req: Request, res: Response) => {
    const parsed = createBookSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const newBook = service.createBook(parsed.data);
    res.status(201).json(newBook);
  };

  update = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = updateBookSchema.safeParse(req.body);

    if (!parsed.success) return res.status(400).json(parsed.error);

    const updated = service.updateBook(id, parsed.data);
    if (!updated) return res.status(404).json({ message: "Book not found" });

    res.json(updated);
  };

  delete = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = service.deleteBook(id);

    if (!deleted) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book deleted successfully" });
  };
}

export default new BooksController();
