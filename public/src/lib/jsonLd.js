// Serialises a JSON-LD object for embedding inside a <script> element.
//
// JSON.stringify alone is NOT safe there. It leaves the less-than sign
// untouched, so a string value containing a closing script tag ends the
// element early and whatever follows is parsed as HTML. Book titles and
// descriptions reach the JSON-LD from Open Library imports and from the
// admin CRUD form, so they are not content we fully control.
//
// Replacing each less-than sign with its six-character JSON unicode escape
// makes that impossible, and the result is still valid JSON that parsers
// decode back to the original string. The Unicode line and paragraph
// separators get the same treatment: legal in JSON, but line terminators in
// JavaScript string literals until ES2019, and escaping them costs nothing.
//
// Two traps this is written around; both produced a silent no-op or a
// syntax error while this file was being created:
//  - the replacement text must contain a DOUBLE backslash. With a single
//    one, JavaScript itself turns the escape back into a plain less-than
//    sign and the replace changes nothing (tests/json-ld.test.js guards it).
//  - the separators are built from char codes, not written as regex
//    literals, because tooling can expand them into the real separator
//    character, and a real one inside a regex literal or a // comment is a
//    syntax error.
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .split(LINE_SEPARATOR).join("\\u2028")
    .split(PARAGRAPH_SEPARATOR).join("\\u2029");
}
