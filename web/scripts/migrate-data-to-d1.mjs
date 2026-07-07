// Generates migrations/0002_seed.sql from the existing static data modules.
// Run once per environment: node scripts/migrate-data-to-d1.mjs > ../migrations/0002_seed.sql
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(__dirname, "../../migrations/0002_seed.sql");

const esc = (v) => {
  if (v === undefined || v === null) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
};
const json = (v) => esc(JSON.stringify(v ?? null));

function extractAsin(url) {
  if (!url) return null;
  const m = String(url).match(/\/dp\/([A-Z0-9]{10})/i);
  return m ? m[1] : null;
}

async function main() {
  const lines = [];

  const { booksTranslations } = await import("../src/data/books/index.js");
  for (const [lang, books] of Object.entries(booksTranslations)) {
    for (const b of books || []) {
      const asin = extractAsin(b.buttons?.getBook);
      lines.push(
        `INSERT INTO books (slug, lang, title, author, publisher, price, isbn, language, published, original_published, page_count, format, description, summary, category, collection, genres_json, subjects_json, tags_json, key_points_json, rating, image_url, country, continent, sub_region, amazon_asin, amazon_url, know_more_url, read_summary_url, listen_audiobook_url) VALUES (` +
          [
            esc(b.slug), esc(lang), esc(b.title), esc(b.author), esc(b.publisher), esc(b.price), esc(b.isbn),
            esc(b.language), esc(b.published), esc(b.originalPublished), b.pageCount ?? "NULL", esc(b.format),
            esc(b.description), esc(b.summary), esc(b.category), esc(b.collection), json(b.genres), json(b.subjects),
            json(b.tags), json(b.keyPoints), b.rating ?? "NULL", esc(b.imageUrl), esc(b.geography?.country ?? b.country),
            esc(b.geography?.continent), esc(b.geography?.subRegion ?? b.geography?.["Sub Region"]), esc(asin),
            esc(b.buttons?.getBook), esc(b.buttons?.knowMore), esc(b.buttons?.readSummary), esc(b.buttons?.listenAudiobook),
          ].join(", ") +
          `) ON CONFLICT(slug, lang) DO NOTHING;`
      );
    }
  }

  const { authorsData } = await import("../src/data/authors/index.js");
  for (const [lang, authors] of Object.entries(authorsData)) {
    for (const a of authors || []) {
      lines.push(
        `INSERT INTO authors (slug, lang, name, birth_year, country, bio, book_count, most_famous_work, genres_json, image_url, socials_json, buttons_json) VALUES (` +
          [
            esc(a.slug), esc(lang), esc(a.name), a.birthYear ?? "NULL", esc(a.country), esc(a.bio), a.bookCount ?? "NULL",
            esc(a.mostFamousWork), json(a.genres), esc(a.image), json(a.socials), json(a.buttons),
          ].join(", ") +
          `) ON CONFLICT(slug, lang) DO NOTHING;`
      );
    }
  }

  const { publicationsData } = await import("../src/data/publications/index.js");
  for (const [lang, pubs] of Object.entries(publicationsData)) {
    for (const p of pubs || []) {
      lines.push(
        `INSERT INTO publications (slug, lang, name, description, logo_url, founded, headquarters, website, type, about, notable_authors_json, imprints_json, key_publications_json, employees, revenue, parent_company, social_media_json) VALUES (` +
          [
            esc(p.slug), esc(lang), esc(p.name), esc(p.description), esc(p.logo), esc(p.founded), esc(p.headquarters),
            esc(p.website), esc(p.type), esc(p.about), json(p.notableAuthors), json(p.imprints), json(p.keyPublications),
            esc(p.employees), esc(p.revenue), esc(p.parentCompany), json(p.socialMedia),
          ].join(", ") +
          `) ON CONFLICT(slug, lang) DO NOTHING;`
      );
    }
  }

  const { comicsTranslations } = await import("../src/data/comics/index.js");
  for (const [lang, comics] of Object.entries(comicsTranslations)) {
    for (const c of comics || []) {
      lines.push(
        `INSERT INTO comics (slug, lang, title, category, publisher, publication_date, cover_price, format, characters_introduced_json, editor, writers_artists_json, description, image_url, first_print_sales, second_print_sales, value_today, fun_fact, rating) VALUES (` +
          [
            esc(c.slug), esc(lang), esc(c.title), esc(c.category), esc(c.publisher), esc(c.publicationDate),
            esc(c.coverPrice), esc(c.format), json(c.charactersIntroduced), esc(c.creators?.editor),
            json(c.creators?.writersArtists), esc(c.description), esc(c.image), esc(c.sales?.firstPrint),
            esc(c.sales?.secondPrint), esc(c.valueToday), esc(c.funFact), c.rating ?? "NULL",
          ].join(", ") +
          `) ON CONFLICT(slug, lang) DO NOTHING;`
      );
    }
  }

  writeFileSync(outFile, lines.join("\n") + "\n");
  console.log(`Wrote ${lines.length} insert statements to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
