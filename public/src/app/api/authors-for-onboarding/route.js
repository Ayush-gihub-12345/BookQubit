import { NextResponse } from "next/server";
import { listAuthors } from "@/lib/repo";

// Split off from /api/authors when that route was rewritten to be a paginated
// search endpoint (see queryAuthors() in repo.js). This keeps onboarding's
// original contract exactly as it was: up to 200 authors, untrimmed —
// specifically WITH `genres`, since onboarding matches suggested authors
// against the reader's selected genres. The new /api/authors response is
// trimmed and paginated for the browse page and doesn't carry `genres`,
// which would have silently broken this feature (empty genre-matched list,
// degrading to an unordered "rest" fallback) if onboarding had been pointed
// at it instead.
export async function GET() {
  const authors = await listAuthors("en");
  return NextResponse.json({ authors: authors.slice(0, 200) });
}
