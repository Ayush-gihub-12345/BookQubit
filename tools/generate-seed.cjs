const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Recursively collect .js files in src/data and src/datalang
function walk(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(walk(full));
        } else if (item.isFile() && full.endsWith(".js")) {
            files.push(full);
        }
    }
    return files;
}

// Safely evaluate a JS module file to capture exports
function evaluateFile(file) {
    const code = fs.readFileSync(file, "utf8");
    // Remove import/require statements by sandboxing
    const script = new vm.Script(code, { filename: file });
    const context = { module: {}, exports: {}, require: () => ({}), console };
    vm.createContext(context);
    script.runInContext(context);
    return context.module.exports || context.exports || {};
}

// Flatten JS objects/arrays into rows of SQL
function itemsToSQL(items, entityType, lang) {
    const statements = [];
    items.forEach((item, i) => {
        if (!item) return;
        // Infer slug and title
        let slug = item.slug || item.id || item.title || `${entityType}-${i}`;
        slug = slug.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const title = item.title || item.name || item.heading || slug;
        const description = item.description || item.summary || item.bio || "";
        const image = item.image || item.cover_image || item.imageUrl || "";
        // Build INSERT for content_items
        const sqlItem = `INSERT OR REPLACE INTO content_items (
  entity_type, lang, slug, title, subtitle, description, author_name, publisher_name,
  category, subject, level, image_url, body_json, featured, is_new, rating,
  rating_count, publication_year, pages, price, isbn, status, updated_at
) VALUES (
  '${entityType}', '${lang}', '${slug}', '${title.replace("'", "''")}',
  '${(item.subtitle||"").replace("'", "''")}', '${description.replace("'", "''")}',
  '${(item.author||item.authorName||"").replace("'", "''")}',
  '${(item.publisher||item.publisherName||"").replace("'", "''")}',
  '${(item.category||item.type||"").replace("'", "''")}', '${(item.subject||item.genre||"").replace("'", "''")}',
  '${(item.level||"").replace("'", "''")}', '${image.replace("'", "''")}',
  '${JSON.stringify(item).replace(/'/g,"''")}',
  ${item.featured?1:0}, ${item.isNew?1:0}, ${item.rating||0}, ${item.rating_count||item.reviewsCount||0},
  ${item.publication_year||item.year||item.releaseYear||"NULL"}, ${item.pages||"NULL"},
  '${(item.price||"").replace("'", "''")}', '${(item.isbn||item.ISBN||"").replace("'", "''")}',
  'published', CURRENT_TIMESTAMP
);`;
        statements.push(sqlItem);
        // Tags (if any)
        if (Array.isArray(item.tags)) {
            item.tags.forEach(tag => {
                const t = tag.toString().replace("'", "''");
                if (t) {
                    statements.push(`INSERT OR IGNORE INTO content_tags (item_id, tag)
SELECT id, '${t}' FROM content_items WHERE slug='${slug}' AND lang='${lang}';`);
                }
            });
        }
    });
    return statements;
}

const dataDirs = [path.join("src","data"), path.join("src","datalang")];
const allFiles = [].concat(...dataDirs.map(d => walk(d)));
let seedStatements = ["BEGIN TRANSACTION;", "DELETE FROM content_tags;", "DELETE FROM content_items;", "DELETE FROM content_strings;"];
for (const file of allFiles) {
    try {
        const rel = path.relative(process.cwd(), file);
        // Determine entity type from folder name
        let entityType = "content";
        if (rel.includes("authors")) entityType = "author";
        else if (rel.includes("publications")) entityType = "publisher";
        else if (rel.includes("blogs")||rel.includes("news")) entityType = "blog";
        else if (rel.match(/books/)) entityType = "book";
        // Determine language from filename
        let lang = "en";
        const fname = path.basename(file).toLowerCase();
        if (fname.includes("_hindi")||fname.includes("hindi")) lang = "hi";
        else if (fname.includes("_urdu")||fname.includes("urdu")) lang = "ur";
        else if (fname.includes("_spanish")||fname.includes("spanish")) lang = "es";
        // Evaluate module exports
        const data = evaluateFile(file);
        for (const key of Object.keys(data)) {
            const val = data[key];
            if (Array.isArray(val)) {
                seedStatements.push(...itemsToSQL(val, entityType, lang));
            } else if (typeof val === "object" && val !== null) {
                // If the export is an object, we treat its values as strings (i18n content)
                const namespace = path.basename(file, ".js") + "." + key;
                function recurse(obj, prefix="") {
                    for (const k in obj) {
                        if (typeof obj[k] === "object" && obj[k] !== null) {
                            recurse(obj[k], prefix + k + ".");
                        } else {
                            const value = String(obj[k]).replace(/'/g,"''");
                            seedStatements.push(
                                `INSERT OR REPLACE INTO content_strings (namespace, lang, key, value, raw_json, updated_at) VALUES ('${namespace}', '${lang}', '${prefix + k}', '${value}', '${JSON.stringify(obj).replace(/'/g,"''")}', CURRENT_TIMESTAMP);`
                            );
                        }
                    }
                }
                recurse(val);
            }
        }
    } catch (e) {
        console.warn(`Warning: failed to process ${file}: ${e.message}`);
    }
}
seedStatements.push("COMMIT;");
fs.writeFileSync(path.join("database","seed.sql"), seedStatements.join("\n\n"), "utf8");
console.log(`Seed SQL generated: ${seedStatements.length - 4} statements from ${allFiles.length} files.`);
