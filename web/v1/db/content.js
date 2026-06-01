import { getCloudflareContext } from "@opennextjs/cloudflare";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function getEnv(request) {
  if (request?.env?.bookqubit_content || request?.env?.CONTENT_DB || request?.env?.DB) {
    return request.env;
  }
  return getCloudflareContext().env;
}

function clampLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBook(row) {
  const tags = parseList(row.tags);
  const subjects = parseList(row.subjects);
  const category = row.category || row.genre || "";

  return {
    ...row,
    title: row.displayTitle || row.title,
    slug: row.slug || row.canonical_slug,
    coverImage: row.coverImage || row.cover_url || "",
    image: row.image || row.cover_url || "",
    category,
    genre: category,
    tags,
    subjects,
    rating: row.rating ? Number(row.rating) : 0,
    popularity: row.popularity ? Number(row.popularity) : 0,
  };
}

function normalizeAuthor(row) {
  const genres = parseList(row.genres);

  return {
    ...row,
    image: row.image || row.image_url || "",
    imageUrl: row.image || row.image_url || "",
    bookCount: Number(row.bookCount || 0),
    genres,
    country: row.country || "",
  };
}

function normalizePublication(row) {
  return {
    ...row,
    name: row.name || row.title,
    type: row.type || row.publication_type || "Publisher",
    logo: row.logo || row.logo_url || row.cover_url || "",
    image: row.logo || row.logo_url || row.cover_url || "",
    headquarters: row.headquarters || "",
    founded: row.founded || "",
  };
}

function booksSelectSql(whereSql = "") {
  return `
    SELECT
      b.id,
      b.title,
      COALESCE(t.translated_slug, b.canonical_slug) AS slug,
      b.canonical_slug,
      COALESCE(t.translated_title, b.title) AS displayTitle,
      COALESCE(t.seo_description, b.description) AS description,
      b.cover_url AS coverImage,
      b.cover_url AS image,
      b.isbn,
      b.language_source AS language,
      b.book_type AS bookType,
      b.status,
      b.created_at AS createdAt,
      b.updated_at AS updatedAt,
      a.name AS author,
      a.slug AS authorSlug,
      a.bio AS authorBio,
      p.name AS publisher,
      p.slug AS publisherSlug,
      MAX(CASE WHEN m.key IN ('genre', 'category') THEN m.value END) AS category,
      GROUP_CONCAT(CASE WHEN m.key = 'tag' THEN m.value END) AS tags,
      GROUP_CONCAT(CASE WHEN m.key = 'subject' THEN m.value END) AS subjects,
      MAX(CASE WHEN m.key = 'rating' THEN m.value END) AS rating,
      MAX(CASE WHEN m.key = 'popularity' THEN m.value END) AS popularity
    FROM books b
    LEFT JOIN authors a ON a.id = b.author_id
    LEFT JOIN publishers p ON p.id = b.publisher_id
    LEFT JOIN translations t
      ON t.entity_type = 'book'
     AND t.entity_id = b.id
     AND t.language_code = ?
    LEFT JOIN metadata m
      ON m.entity_type = 'book'
     AND m.entity_id = b.id
    WHERE b.status = 'published'
    ${whereSql}
    GROUP BY b.id
  `;
}

function authorsSelectSql(whereSql = "") {
  return `
    SELECT
      a.id,
      a.name,
      a.slug,
      a.bio,
      a.image_url AS image,
      a.website,
      a.created_at AS createdAt,
      a.updated_at AS updatedAt,
      COUNT(DISTINCT b.id) AS bookCount,
      GROUP_CONCAT(DISTINCT CASE WHEN m.key IN ('genre', 'category') THEN m.value END) AS genres,
      MAX(CASE WHEN am.key = 'country' THEN am.value END) AS country,
      MAX(CASE WHEN am.key = 'birthYear' THEN am.value END) AS birthYear,
      MAX(CASE WHEN am.key = 'deathYear' THEN am.value END) AS deathYear,
      MAX(CASE WHEN am.key = 'mostFamousWork' THEN am.value END) AS mostFamousWork
    FROM authors a
    LEFT JOIN books b ON b.author_id = a.id AND b.status = 'published'
    LEFT JOIN metadata m ON m.entity_type = 'book' AND m.entity_id = b.id
    LEFT JOIN metadata am ON am.entity_type = 'author' AND am.entity_id = a.id
    WHERE 1 = 1
    ${whereSql}
    GROUP BY a.id
  `;
}

function publicationsSelectSql(whereSql = "") {
  return `
    SELECT
      p.id,
      p.title,
      p.title AS name,
      p.slug,
      p.description,
      p.cover_url AS logo,
      p.publication_type AS type,
      p.created_at AS createdAt,
      p.updated_at AS updatedAt,
      pub.name AS publisher,
      pub.slug AS publisherSlug,
      pub.logo_url AS publisherLogo,
      pub.website AS website,
      MAX(CASE WHEN pm.key = 'headquarters' THEN pm.value END) AS headquarters,
      MAX(CASE WHEN pm.key = 'founded' THEN pm.value END) AS founded
    FROM publications p
    LEFT JOIN publishers pub ON pub.id = p.publisher_id
    LEFT JOIN metadata pm ON pm.entity_type = 'publication' AND pm.entity_id = p.id
    WHERE 1 = 1
    ${whereSql}
    GROUP BY p.id
  `;
}

export async function getContentDb(request) {
  const env = getEnv(request);
  const db = env?.bookqubit_content || env?.CONTENT_DB || env?.DB;
  if (!db) {
    throw new Error("D1 content binding is not configured. Expected bookqubit_content, CONTENT_DB, or DB.");
  }
  return db;
}

export async function listBooksFromDb(request, options = {}) {
  const db = await getContentDb(request);
  const language = options.language || "en";
  const limit = clampLimit(options.limit);
  const offset = Math.max(Number.parseInt(options.offset, 10) || 0, 0);

  const typeFilter = options.bookType
    ? " AND b.book_type = ?"
    : "";
  const params = options.bookType
    ? [language, options.bookType, limit, offset]
    : [language, limit, offset];

  const result = await db
    .prepare(`${booksSelectSql(typeFilter)} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params)
    .all();

  return (result.results || []).map(normalizeBook);
}

export async function searchBooksFromDb(request, options = {}) {
  const db = await getContentDb(request);
  const language = options.language || "en";
  const search = `%${options.query || ""}%`;
  const limit = clampLimit(options.limit);

  const typeFilter = options.bookType ? " AND b.book_type = ?" : "";
  const params = options.bookType
    ? [language, search, search, search, search, options.bookType, limit]
    : [language, search, search, search, search, limit];

  const result = await db
    .prepare(
      `${booksSelectSql(`
        AND (
          b.title LIKE ?
          OR b.description LIKE ?
          OR a.name LIKE ?
          OR t.translated_title LIKE ?
        )
        ${typeFilter}
      `)}
      ORDER BY b.created_at DESC
      LIMIT ?`,
    )
    .bind(...params)
    .all();

  return (result.results || []).map(normalizeBook);
}

export async function getBooksByGenreFromDb(request, options = {}) {
  const db = await getContentDb(request);
  const language = options.language || "en";
  const genre = options.genre || "";
  const limit = clampLimit(options.limit);

  const result = await db
    .prepare(
      `${booksSelectSql(`
        AND EXISTS (
          SELECT 1
          FROM metadata gm
          WHERE gm.entity_type = 'book'
            AND gm.entity_id = b.id
            AND gm.key IN ('genre', 'category')
            AND gm.value = ?
        )
      `)}
      ORDER BY b.created_at DESC
      LIMIT ?`,
    )
    .bind(language, genre, limit)
    .all();

  return (result.results || []).map(normalizeBook);
}

export async function getBookBySlugFromDb(request, slug, language = "en") {
  const db = await getContentDb(request);

  const result = await db
    .prepare(
      `${booksSelectSql(`
        AND (
          b.canonical_slug = ?
          OR t.translated_slug = ?
        )
      `)}
      LIMIT 1`,
    )
    .bind(language, slug, slug)
    .first();

  return result ? normalizeBook(result) : null;
}

export async function getTopBooksFromDb(request, options = {}) {
  const db = await getContentDb(request);
  const language = options.language || "en";
  const limit = clampLimit(options.limit);
  const typeFilter = options.bookType ? " AND b.book_type = ?" : "";
  const params = options.bookType ? [language, options.bookType, limit] : [language, limit];

  const result = await db
    .prepare(
      `${booksSelectSql(typeFilter)}
      ORDER BY CAST(COALESCE(MAX(CASE WHEN m.key = 'rating' THEN m.value END), '0') AS REAL) DESC, b.created_at DESC
      LIMIT ?`,
    )
    .bind(...params)
    .all();

  return (result.results || []).map(normalizeBook);
}

export async function listAuthorsFromDb(request, options = {}) {
  const db = await getContentDb(request);
  const limit = clampLimit(options.limit);
  const offset = Math.max(Number.parseInt(options.offset, 10) || 0, 0);

  const result = await db
    .prepare(`${authorsSelectSql()} ORDER BY bookCount DESC, a.name ASC LIMIT ? OFFSET ?`)
    .bind(limit, offset)
    .all();

  return (result.results || []).map(normalizeAuthor);
}

export async function getAuthorBySlugFromDb(request, slug) {
  const db = await getContentDb(request);

  const result = await db
    .prepare(`${authorsSelectSql(" AND a.slug = ?")} LIMIT 1`)
    .bind(slug)
    .first();

  return result ? normalizeAuthor(result) : null;
}

export async function listPublicationsFromDb(request, options = {}) {
  const db = await getContentDb(request);
  const limit = clampLimit(options.limit);
  const offset = Math.max(Number.parseInt(options.offset, 10) || 0, 0);

  const result = await db
    .prepare(`${publicationsSelectSql()} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`)
    .bind(limit, offset)
    .all();

  return (result.results || []).map(normalizePublication);
}

export async function getPublicationBySlugFromDb(request, slug) {
  const db = await getContentDb(request);

  const result = await db
    .prepare(`${publicationsSelectSql(" AND p.slug = ?")} LIMIT 1`)
    .bind(slug)
    .first();

  return result ? normalizePublication(result) : null;
}
