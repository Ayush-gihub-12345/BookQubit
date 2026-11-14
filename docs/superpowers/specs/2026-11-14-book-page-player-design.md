# Book page, player and platform resilience — design (Phase 3, revision 2)

Status: revised from your feedback (Blinkist/Shortform feel; scale; KV caching; Workers AI at import). Size: a project.

## Intent
A reader lands on a book and, within seconds, can **read or listen** to its key ideas in about a minute, go deeper if they want, and keep listening while they browse. The site must stay up and fast as users grow.

## Design direction: Blinkist x Shortform (own implementation, no copied assets)
From Blinkist: a **Read | Listen** switch as the primary control; ideas as short, scannable insight cards; a calm, high-contrast reader; a bottom mini player with a hairline progress bar that expands to a full player (big cover, scrubber, speed, sleep, +/-15s).
From Shortform: **layered depth** on one page, "1-minute | Key ideas | Full summary" tabs, plus an "Apply it" action section; dense but well-spaced, serif body for reading.
Ours: audience angle tabs (General, Founder, Builder, Student, Action plan); a gold underline on the sentence being read aloud; emerald accent on warm paper (Light), OLED Dark, Sepia reader.

```
[cover]  Title (serif)               Read | Listen   <- primary
         Author                       + Shelf  Save to MindSpace
         1 min  ·  4 key ideas
 General  Founder  Builder  Student  Action      <- angle tabs
 1-minute | Key ideas | Full summary             <- depth tabs
 ┃ Thesis (large serif)
 ┃ [ idea card ]  [ idea card ]  ...             <- no numbering
 Apply it (Action angle)
 Get the book (affiliate, labelled)  ·  Audible (external)
```

## Goals
- Every book has a readable and playable summary with zero setup; AI adds angles and real audio.
- One global player surviving navigation; resume across devices when signed in.
- Geo-routed, labelled, logged outbound links.
- **Resilience at scale:** no page depends on an optional service; each layer degrades to the next.

## Resilience and scale design
- **Cache tiers:** memory -> edge Cache API -> **Workers KV (new, global)** -> D1 `app_cache` -> source query, all stale-while-revalidate with 24 h last-known-good. KV is additive: write-budgeted (120/min/isolate), circuit-breaker on any error (10 min on quota errors), user-scoped keys excluded, so it cannot repeat the earlier incident where a cache tier silently turned into uncached reads.
- AI never sits on the request path for the default view: the baseline summary renders instantly; AI results are cached in KV + D1 and generated in the queue or rate-limited (20/h/IP).
- Optional bindings (KV, AI, Vectorize, R2, Queue, DO) are all fail-open.

## Workers AI at book import
The importer already calls AI twice per book (polish synopsis, key points) under the 50-subrequest cap. It now makes **one combined call** that returns key takeaways plus a structured 1-minute summary (thesis, takeaways, narration script), stored in `book_summaries` (INSERT OR IGNORE, skipped harmlessly until the catalog migration is applied). Model is configurable (`AI_MODEL`); `AI_ONE_MINUTE=0` turns the extra output off.

## Non-goals
Unlicensed full audiobooks; server TTS for non-English (browser speech fallback); audio bookmarks/chapters (need MindSpace / chaptered audio).

## Anti-goals
Stacked fixed bars on mobile; equal-weight buy/shelve/listen/save buttons; any dead control; any crash from a missing binding.

## Decisions (my calls)
Brand-600 `#047857` for contrast; old sticky "Get Book" bar removed on book pages (buy moves into the footer row); karaoke timing for audio files proportional to sentence length; mini player is the only fixed bar above the tab bar.

## Left to the builder
Spacing/type scale, sheet animation, empty/error copy (plain verbs, sentence case).
