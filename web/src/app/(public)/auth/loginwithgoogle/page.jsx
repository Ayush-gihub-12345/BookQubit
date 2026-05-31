"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useTheme } from "@/themes/useTheme";
import { FaGoogle } from "react-icons/fa";

const GoogleAuth = () => {
  const { theme, themeName } = useTheme();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("User signed in:", result.user);
      router.push("/profile");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen flex items-center justify-center p-4`}
    >
      <div
        className={`${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-xl'} w-full max-w-md p-8 rounded-2xl`}
      >
        <div className="text-center mb-6">
          <div className={`flex justify-center mb-4`}>
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')}`}>
              <FaGoogle className={`text-3xl ${theme.textColors?.highlight || 'text-red-500'}`} />
            </div>
          </div>
          <h1
            className={`text-3xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
          >
            Welcome Back
          </h1>
          <p className={`mt-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            Sign in to continue your reading journey
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-white hover:bg-gray-100 text-gray-900"
          } border ${theme.border?.default || 'border-gray-300 dark:border-gray-600'}`}
        >
          <FaGoogle className="text-red-500" size={18} />
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <div className="relative my-6">
          <div className={`absolute inset-0 flex items-center ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
              Or
            </span>
          </div>
        </div>

        <Link
          href="/auth/login"
          className={`block w-full py-3 text-center rounded-lg font-medium transition-all hover:scale-105 ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'} mb-3`}
        >
          Sign in with Email
        </Link>

        <p className={`text-center ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className={`${theme.textColors?.highlight || 'text-sky-600'} hover:underline font-medium`}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default GoogleAuth;