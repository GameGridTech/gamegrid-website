"use client";

/**
 * Client-side providers wrapper
 * Wraps the app with Google OAuth and Auth providers
 */

import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/lib/auth-context";

interface AuthProvidersProps {
  children: ReactNode;
}

// Google OAuth Client ID from environment variable
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function AuthProviders({ children }: AuthProvidersProps) {
  // Warn in development if client ID is missing
  if (!GOOGLE_CLIENT_ID && process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not work."
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>{children}</AuthProvider>
    </GoogleOAuthProvider>
  );
}

