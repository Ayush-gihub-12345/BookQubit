import { getDb } from "./d1";
import { cached } from "./kv";

const parse = (v) => (v ? JSON.parse(v) : undefined);

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    birthYear: row.birth_year,
    country: row.country,
    bio: row.bio,
    bookCount: row.book_count,
    mostFamousWork: row.most_famous_work,
    genres: parse(row.genres_json) || [],
    image: row.image_url,
    socials: parse(row.socials_json) || {},
    buttons: parse(row.buttons_json) || [],
  };
}

export async function getAuthorsByLanguage(lang) {
  return cached(`authors:${lang}`, async () => {
    const db = await getDb();
    const { results } = await db
      .prepare("SELECT * FROM authors WHERE lang = ?1 ORDER BY id ASC")
      .bind(lang)
      .all();
    if (results.length || lang === "en") return results.map(mapRow);

    const fallback = await db.prepare("SELECT * FROM authors WHERE lang = 'en' ORDER BY id ASC").all();
    return fallback.results.map(mapRow);
  });
}

export async function getAuthorBySlug(slug, lang) {
  if (!slug) return null;
  const authors = await getAuthorsByLanguage(lang);
  return authors.find((a) => a.slug === slug) || null;
}
