// Request-level authentication for API routes.
//
// Why this file exists: every user-scoped GET endpoint used to read its
// subject straight out of `?uid=` and trust it —
//
//   const uid = searchParams.get("uid");
//   return NextResponse.json({ shelf: await getShelf(uid) });
//
// Firebase UIDs are not secret on this site: /readers lists reader profiles
// and `readers/[id]/page.jsx` renders `user.id` into the markup (the
// FollowButton's `id` prop). So anyone could harvest UIDs from public pages
// and then read those readers' shelves (including unpublished reviews,
// progress and spoiler flags), notifications, discussion list, follow graph
// and year-in-books. src/lib/db.js already treats this data as sensitive —
// its USER_SCOPED regex keeps those cache keys out of the public-URL edge
// tier for exactly this reason — but the routes themselves did not.
//
// The fix here deliberately does NOT compare a token's uid against a `uid`
// parameter. It ignores the parameter entirely and derives the subject from
// the verified token, so there is no way to ask these endpoints about
// somebody else: the identity is a property of the credential, not of the
// request's arguments. Callers that still send `?uid=` are harmless.
import { NextResponse } from "next/server";
import { verifyUserStrict } from "@/lib/auth-server";

// Bearer token from the Authorization header, which is where a credential
// belongs: a query string lands in access logs, in Referer headers, and —
// relevant here — in the Cache API key space used by src/lib/db.js.
//
// `?idToken=` is deliberately NOT accepted for that reason. A JSON body
// `idToken` still is, because every existing mutation on this site already
// posts one (see api/shelf, api/follow, api/quotes, api/discussions/*) and
// those call sites are not in scope for this change.
export function bearerToken(request) {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

// Resolves the caller from the request's own credential, or null.
export async function getRequestUser(request) {
  const token = bearerToken(request);
  if (!token) return null;
  return verifyUserStrict(token);
}

// Guard for a route that serves the signed-in reader their own data.
//
// Returns either `{ user }` or `{ response }` — the caller returns the
// response as-is and otherwise uses `user.uid` as the subject:
//
//   const auth = await requireUser(request);
//   if (auth.response) return auth.response;
//   return NextResponse.json({ shelf: await getShelf(auth.user.uid) });
//
// 401 vs 503 matters. src/lib/auth-server.js verifies tokens by calling
// Google's Identity Toolkit over the network, and its `if (!res.ok) return
// null` collapses "this token is forged" and "Google just 500'd" into the
// same answer. Reporting a transient upstream failure as 401 tells the
// browser the session is invalid and invites a pointless sign-out, so a
// request that carried no credential at all gets 401 while a request that
// carried one we could not check gets 503 and may be retried.
export async function requireUser(request) {
  const token = bearerToken(request);
  if (!token) {
    return { response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  let user;
  try {
    user = await verifyUserStrict(token);
  } catch {
    return {
      response: NextResponse.json(
        { error: "could not verify credentials, try again" },
        { status: 503 }
      ),
    };
  }
  if (!user) {
    return { response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { user };
}
