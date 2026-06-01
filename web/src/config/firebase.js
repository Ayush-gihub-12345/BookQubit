// src/config/firebase.js

import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

  // IMPORTANT:
  // MUST be firebaseapp.com domain
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;

export const googleProvider = new GoogleAuthProvider();

/* -------------------------------- */
/* GOOGLE LOGIN FUNCTION */
/* -------------------------------- */

export const signInWithGoogle = async () => {
  if (!auth) {
    return {
      success: false,
      error: "Firebase client configuration is missing.",
    };
  }

  try {
    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    const user = result.user;

    console.log("Google Login Success:", user);

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};
