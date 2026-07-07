import { getDb } from "./d1";
import { cached } from "./kv";

const parse = (v) => (v ? JSON.parse(v) : undefined);

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    logo: row.logo_url,
    founded: row.founded,
    headquarters: row.headquarters,
    website: row.website,
    type: row.type,
    about: row.about,
    notableAuthors: parse(row.notable_authors_json) || [],
    imprints: parse(row.imprints_json) || [],
    keyPublications: parse(row.key_publications_json) || [],
    employees: row.employees,
    revenue: row.revenue,
    parentCompany: row.parent_company,
    socialMedia: parse(row.social_media_json) || {},
  };
}

export async function getPublicationsByLanguage(lang) {
  return cached(`publications:${lang}`, async () => {
    const db = await getDb();
    const { results } = await db
      .prepare("SELECT * FROM publications WHERE lang = ?1 ORDER BY id ASC")
      .bind(lang)
      .all();
    if (results.length || lang === "en") return results.map(mapRow);

    const fallback = await db.prepare("SELECT * FROM publications WHERE lang = 'en' ORDER BY id ASC").all();
    return fallback.results.map(mapRow);
  });
}

export async function getPublicationBySlug(slug, lang) {
  if (!slug) return null;
  const publications = await getPublicationsByLanguage(lang);
  return publications.find((p) => p.slug === slug) || null;
}
