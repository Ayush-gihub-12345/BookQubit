"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Client-side Firebase config. These values are public by design — Firebase
// web config identifies the project, it doesn't authorize anything, and it
// ships to every visitor inside the JS bundle regardless. Access is governed
// by Firebase Security Rules and the Authorized Domains list, not by keeping
// these hidden. (Server-side keys are a different matter and stay secrets.)
//
// They're inlined here as defaults rather than relying only on build-time
// env vars, because these are NEXT_PUBLIC_* — baked in during `next build`,
// not read at runtime. When the Cloudflare build config lost its build
// variables, the deployed bundle silently shipped with apiKey undefined,
// firebaseEnabled false, and sign-in dead with no error anywhere. Defaults
// mean a plain `git push` is always sufficient to ship working auth; the env
// vars still win when present, so a staging project can override them.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBKSZnmcB7AOvJCMSz087kheEp7NDAtwEU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bookqubit-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bookqubit-app",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:826218899536:web:ea1004328068c3a1010955",
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

export function getFirebaseAuth() {
  if (!firebaseEnabled) return null;
  const app = getApps()[0] || initializeApp(config);
  return getAuth(app);
}
