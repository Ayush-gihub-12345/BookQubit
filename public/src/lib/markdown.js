// Minimal, safe Markdown → HTML for MindSpace notes (which can be public). Design: ESCAPE FIRST,
// then add a small whitelist of tags we generate ourselves. User text can never introduce markup:
// every `<`, `>`, `&`, `"`, `'` is entity-encoded before any transformation, and links are only
// emitted for http(s) URLs. Supports: # headings, **bold**, *italic*, `code`, [text](url), -/* lists,
// > quotes and paragraphs.

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function inline(s) {
  return s
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    // The text was already escaped, so a URL arrives entity-encoded ("&amp;" etc.); that is exactly what
    // belongs inside an attribute. Only http(s) is accepted, and the quote chars are already &quot;.
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer nofollow ugc">$1</a>');
}

export function renderMarkdown(src) {
  const lines = esc(String(src || "").slice(0, 20000)).split(/\r?\n/);
  const out = [];
  let list = null, para = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<ul>${list.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`); list = null; } };
  for (const line of lines) {
    let m;
    if (!line.trim()) { flushPara(); flushList(); }
    else if ((m = line.match(/^(#{1,3})\s+(.*)$/))) { flushPara(); flushList(); out.push(`<h${m[1].length + 2}>${inline(m[2])}</h${m[1].length + 2}>`); }
    else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) { flushPara(); (list ||= []).push(m[1]); }
    else if ((m = line.match(/^&gt;\s?(.*)$/))) { flushPara(); flushList(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); }
    else { flushList(); para.push(line.trim()); }
  }
  flushPara(); flushList();
  return out.join("");
}
