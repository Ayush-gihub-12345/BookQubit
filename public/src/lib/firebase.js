"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Client-side Firebase config — set these as BUILD-TIME env vars
// (Cloudflare dashboard → Worker → Settings → Build → Variables).
// These values are public by design; only server keys are secrets.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

export function getFirebaseAuth() {
  if (!firebaseEnabled) return null;
  const app = getApps()[0] || initializeApp(config);
  return getAuth(app);
}
