"use client";

import { getFirebaseAuth } from "@/lib/firebase";

/** fetch() with the signed-in reader's Firebase ID token. Resolves to null when nobody is signed in. */
export async function authFetch(url, init = {}) {
  const user = getFirebaseAuth()?.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return fetch(url, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}`, ...(init.body ? { "Content-Type": "application/json" } : {}) },
  });
}

/** Wait for Firebase to restore the session, then resolve to the user (or null). */
export function whenSignedIn() {
  return new Promise((resolve) => {
    const auth = getFirebaseAuth();
    if (!auth) return resolve(null);
    const off = auth.onAuthStateChanged((u) => { off(); resolve(u); });
  });
}
