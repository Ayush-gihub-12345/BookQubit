import { normalizeBookRow, queryD1 } from "./cloudflareD1";

const SORTS = {
  "title-asc": "title COLLATE NOCASE ASC",
  "title-desc": "title COLLATE NOCASE DESC",
  "author-asc": "author COLLATE NOCASE ASC",
  "author-desc": "author COLLATE NOCASE DESC",
  "date-newest": "b.created_at DESC",
  "date-oldest": "b.created_at ASC",
  popular: "b.created_at DESC",
  rating: "b.created_at DESC",
};

const BOOK_SELECT = `
  b.id,
  COALESCE(t.translated_title, b.title) AS title,
  COALESCE(t.seo_title, t.translated_title, b.title) AS seoTitle,
  COALESCE(t.seo_description, b.description) AS seoDescription,
  COALESCE(t.translated_slug, b.canonical_slug) AS slug,
  b.canonical_slug AS canonicalSlug,
  b.description,
  b.cover_url AS coverImage,
  b.cover_url AS imageUrl,
  b.isbn,
  b.language_source AS originalLanguage,
  ? AS language,
  b.book_type AS bookType,
  b.status,
  b.created_at AS createdAt,
  b.updated_at AS updatedAt,
  a.name AS author,
  a.slug AS authorSlug,
  p.name AS publisher,
  p.slug AS publisherSlug,
  COALESCE(meta.genre, '') AS genre,
  COALESCE(meta.genre, '') AS category,
  '' AS collection,
  CASE
    WHEN meta.genre IS NULL OR meta.genre = '' THEN '[]'
    ELSE json_array(meta.genre)
  END AS tags,
  0 AS rating,
  strftime('%Y', b.created_at) AS published
`;

const BOOK_JOINS = `
  FROM books b
  LEFT JOIN authors a ON a.id = b.author_id
  LEFT JOIN publishers p ON p.id = b.publisher_id
  LEFT JOIN (
    SELECT
      entity_id,
      MAX(CASE WHEN key = 'genre' THEN value END) AS genre
    FROM metadata
    WHERE entity_type = 'book'
    GROUP BY entity_id
  ) meta ON meta.entity_id = b.id
  LEFT JOIN translations t
    ON t.entity_type = 'book'
    AND t.entity_id = b.id
    AND t.language_code = ?
`;

const toPositiveInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

export const getBooksFromD1 = async ({
  lang = "en",
  search,
  category,
  author,
  collection,
  sort = "title-asc",
  page = 1,
  limit = 100,
} = {}) => {
  const where = ["b.status = 'published'"];
  const params = [];

  if (search) {
    where.push(
      "(COALESCE(t.translated_title, b.title) LIKE ? OR a.name LIKE ? OR b.description LIKE ? OR b.isbn LIKE ?)",
    );
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  if (author) {
    where.push("a.name = ?");
    params.push(author);
  }

  if (category) {
    where.push("meta.genre = ?");
    params.push(category);
  }

  const pageNumber = toPositiveInt(page, 1, 100000);
  const pageSize = toPositiveInt(limit, 100, 500);
  const offset = (pageNumber - 1) * pageSize;
  const orderBy = SORTS[sort] || SORTS["title-asc"];

  const rows = await queryD1(
    `
      SELECT ${BOOK_SELECT}
      ${BOOK_JOINS}
      WHERE ${where.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `,
    [lang, lang, ...params, pageSize, offset],
  );

  const countRows = await queryD1(
    `
      SELECT COUNT(*) AS total
      ${BOOK_JOINS}
      WHERE ${where.join(" AND ")}
    `,
    [lang, ...params],
  );

  return {
    books: rows.map(normalizeBookRow).filter(Boolean),
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total: countRows?.[0]?.total || 0,
    },
  };
};

export const getBookBySlugFromD1 = async (slug, lang = "en") => {
  if (!slug) return null;

  const rows = await queryD1(
    `
      SELECT ${BOOK_SELECT}
      ${BOOK_JOINS}
      WHERE b.status = 'published'
        AND (
          LOWER(b.canonical_slug) = LOWER(?)
          OR LOWER(t.translated_slug) = LOWER(?)
          OR CAST(b.id AS TEXT) = ?
        )
      LIMIT 1
    `,
    [lang, lang, slug, slug, slug],
  );

  return normalizeBookRow(rows?.[0]);
};

export const getBookLanguageSlugsFromD1 = async (bookId, fallbackSlug) => {
  if (!bookId) return {};

  const rows = await queryD1(
    `
      SELECT language_code AS language, translated_slug AS slug
      FROM translations
      WHERE entity_type = 'book'
        AND entity_id = ?
        AND translated_slug IS NOT NULL
        AND translated_slug != ''
    `,
    [bookId],
  );

  return rows.reduce((slugs, row) => {
    if (row.language && row.slug) slugs[row.language] = row.slug;
    return slugs;
  }, fallbackSlug ? { en: fallbackSlug } : {});
};
