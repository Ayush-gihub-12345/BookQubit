import { getDb } from "./d1";
import { cached } from "./kv";

const parse = (v) => (v ? JSON.parse(v) : undefined);

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    publisher: row.publisher,
    publicationDate: row.publication_date,
    coverPrice: row.cover_price,
    format: row.format,
    charactersIntroduced: parse(row.characters_introduced_json) || [],
    creators: {
      editor: row.editor,
      writersArtists: parse(row.writers_artists_json) || [],
    },
    description: row.description,
    image: row.image_url,
    sales: {
      firstPrint: row.first_print_sales,
      secondPrint: row.second_print_sales,
    },
    valueToday: row.value_today,
    funFact: row.fun_fact,
    rating: row.rating,
  };
}

export async function getComicsByLanguage(lang) {
  return cached(`comics:${lang}`, async () => {
    const db = await getDb();
    const { results } = await db
      .prepare("SELECT * FROM comics WHERE lang = ?1 ORDER BY id ASC")
      .bind(lang)
      .all();
    if (results.length || lang === "en") return results.map(mapRow);

    const fallback = await db.prepare("SELECT * FROM comics WHERE lang = 'en' ORDER BY id ASC").all();
    return fallback.results.map(mapRow);
  });
}

export async function getComicBySlug(slug, lang) {
  if (!slug) return null;
  const comics = await getComicsByLanguage(lang);
  return comics.find((c) => c.slug === slug) || null;
}
