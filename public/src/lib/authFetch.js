"use client";

import { getFirebaseAuth } from "@/lib/firebase";

// fetch() that attaches the signed-in reader's Firebase ID token as a
// bearer credential. Use this for every call to an endpoint that serves the
// reader their own data (shelf, notifications, recommendations, ...): those
// endpoints identify the caller from the token and ignore any `?uid=`.
//
// Pass `user` when the caller already holds one (inside onAuthStateChanged,
// where `auth.currentUser` may not be populated yet); otherwise the current
// user is looked up. With nobody signed in the request goes out without a
// credential and the server answers 401 — callers that can run signed-out
// should check for a user first, as they did before.
//
// getIdToken() returns the cached token and refreshes it transparently when
// it is near expiry, so this is cheap to call on every request.
export async function authFetch(url, init = {}, user) {
  const u = user || getFirebaseAuth()?.currentUser;
  const headers = new Headers(init.headers || {});
  if (u) headers.set("Authorization", `Bearer ${await u.getIdToken()}`);
  return fetch(url, { ...init, headers });
}

// Wait for Firebase to restore the session, then resolve to the user (or null).
// (Used by pages that must decide between "signed out" and "still checking".)
export function whenSignedIn() {
  return new Promise((resolve) => {
    const auth = getFirebaseAuth();
    if (!auth) return resolve(null);
    const off = auth.onAuthStateChanged((u) => { off(); resolve(u); });
  });
}
