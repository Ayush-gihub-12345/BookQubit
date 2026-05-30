// src/api/v1/modules/books/validations/books.validation.ts

import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string(),
  slug: z.string(),
  author: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.string(),
  imageUrl: z.string(),
});

export const updateBookSchema = createBookSchema.partial();

export type CreateBookValidation = z.infer<typeof createBookSchema>;
export type UpdateBookValidation = z.infer<typeof updateBookSchema>;
