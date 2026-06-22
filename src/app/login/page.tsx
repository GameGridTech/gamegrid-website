"use client";

/**
 * Login Page
 * Email + code (OTP) login with Google and Apple OAuth options
 * Clean, minimal design matching the GameGrid brand
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import OtpLogin from "@/components/custom/OtpLogin";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, loginWithGoogle } = useAuth();
  
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  /**
   * Handle successful OTP login - redirect to the admin dashboard
   */
  const handleOtpSuccess = () => {
    router.push("/dashboard");
  };

  /**
   * Handle Google login success - receives ID token from GoogleLogin component
   */
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google sign-in failed. No credential received.");
      return;
    }
    
    try {
      // GoogleLogin component provides an ID token (JWT format) in credential field
      await loginWithGoogle(credentialResponse.credential);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    }
  };

  /**
   * Handle Google login error
   */
  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  /**
   * Handle Apple sign in (placeholder)
   */
  const handleAppleSignIn = () => {
    // TODO: Implement Apple Sign In
    setError("Apple Sign In coming soon.");
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a6b2c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="w-full px-6 sm:px-10 lg:px-16 py-6 flex items-center justify-between">
        {/* Logo - Links to Home (Made bigger) */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logos/navbar.png"
            alt="GameGrid"
            width={300}
            height={70}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Help CTA - accounts are created automatically on first sign-in */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-sm text-[#1e40af] font-semibold hidden sm:inline">
            New to GameGrid?
          </span>
          {/* Anchors back to the sign-in form below; first sign-in creates the account */}
          <Link
            href="/login"
            className="rounded-full px-6 py-2.5 text-base font-bold text-white transition-all duration-200 hover:shadow-md hover:scale-105"
            style={{ backgroundColor: "#0f5a1f" }}
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[380px]"
        >
          {/* GameGrid Logo - Made bigger */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36">
              <Image
                src="/logos/gamegrid-logo.png"
                alt="GameGrid Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </motion.div>
          )}

          {/* Email + Code (OTP) Sign In */}
          <OtpLogin onSuccess={handleOtpSuccess} />

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Login Buttons - Matching styles */}
          <div className="space-y-3">
            {/* Google Sign In - Uses GoogleLogin component for proper ID token */}
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="380"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            {/* Apple Sign In Button */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              className="w-full py-3.5 px-4 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
            >
              {/* Apple Logo SVG */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500 mt-8">
            By signing in, you agree to our{" "}
            <Link href="/privacy" className="text-[#1a6b2c] hover:underline">
              Terms & Privacy Policy
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
