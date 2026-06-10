"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { auth, googleProvider } from "@/config/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaArrowRight,
} from "react-icons/fa";

const LoginPage = () => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  if (!theme) return null;

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAlreadyLoggedIn(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email address");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        case "auth/invalid-email":
          setError("Invalid email address format");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later");
          break;
        default:
          setError("Failed to sign in. Please check your credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Failed to sign up with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in, show message
  if (isAlreadyLoggedIn) {
    return (
      <div
        className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen flex items-center justify-center py-12 px-4`}
      >
        <div className="max-w-md w-full text-center">
          <div
            className={`${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} rounded-xl p-8 shadow-xl`}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2
              className={`text-2xl font-bold mb-2 ${theme.textColors?.primary || "text-gray-900"}`}
            >
              Already Logged In
            </h2>
            <p
              className={`mb-6 ${theme.textColors?.secondary || "text-gray-600"}`}
            >
              You are already signed in. Redirecting to home page...
            </p>
            <Link
              href="/"
              className={`inline-block px-6 py-2 ${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white rounded-lg`}
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}
            >
              <FaEnvelope
                className={`text-3xl ${theme.textColors?.highlight || "text-sky-600"}`}
              />
            </div>
          </div>
          <h2
            className={`text-3xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
          >
            Welcome Back
          </h2>
          <p
            className={`mt-2 ${theme.textColors?.secondary || "text-gray-600"}`}
          >
            Sign in to your account to continue reading
          </p>
        </div>

        {/* Login Form */}
        <div
          className={`${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} rounded-xl p-6 md:p-8 shadow-xl`}
        >
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
              >
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || "text-gray-400"}`}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.email ? "border-red-500" : theme.border?.default || "border-gray-300 dark:border-gray-600"} ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-white")} ${theme.textColors?.primary || "text-gray-900"}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
              >
                Password
              </label>
              <div className="relative">
                <FaLock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || "text-gray-400"}`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.password ? "border-red-500" : theme.border?.default || "border-gray-300 dark:border-gray-600"} ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-white")} ${theme.textColors?.primary || "text-gray-900"}`}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || "text-gray-500"} hover:${theme.textColors?.highlight || "text-sky-600"}`}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className={`text-sm ${theme.textColors?.highlight || "text-sky-600"} hover:underline`}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"}`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div
              className={`absolute inset-0 flex items-center ${theme.border?.default || "border-gray-200 dark:border-gray-700"}`}
            >
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className={`px-2 ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.textColors?.secondary || "text-gray-500"}`}
              >
                Or sign up with
              </span>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all hover:scale-105 flex items-center justify-center gap-3 ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-700" : "bg-gray-100")} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} border ${theme.border?.default || "border-gray-200 dark:border-gray-600"}`}
          >
            <FaGoogle className="text-red-500" /> Sign up with Google
          </button>

          {/* Sign Up Link */}
          <p
            className={`mt-6 text-center text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
          >
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className={`${theme.textColors?.highlight || "text-sky-600"} hover:underline font-medium`}
            >
              Sign up with email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
