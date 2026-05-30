// src/api/v1/modules/books/dto/books.dto.ts

export interface CreateBookDTO {
  title: string;
  slug: string;
  author: string;
  description: string;
  category: string;
  price: string;
  imageUrl: string;
}

export interface UpdateBookDTO extends Partial<CreateBookDTO> {}
