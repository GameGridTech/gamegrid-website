"use client";

/**
 * OTP Login Component
 * Handles email-based login with OTP code verification
 */

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { Loader2, Mail, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendOtp } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface OtpLoginProps {
  onSuccess: () => void;
}

export default function OtpLogin({ onSuccess }: OtpLoginProps) {
  const { loginWithOtp } = useAuth();
  
  // State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  // Refs for OTP inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * Countdown timer for resend
   */
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Send OTP to email
   */
  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSendingOtp(true);
    setError(null);

    try {
      await sendOtp(email);
      setStep("otp");
      setResendCountdown(30); // 30 second countdown
      
      // Focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send code. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  /**
   * Handle OTP input change
   */
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 4 digits are entered
    if (newOtp.every((digit) => digit !== "") && index === 3) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  /**
   * Handle backspace key in OTP input
   */
  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input and clear it
      otpInputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  /**
   * Handle paste in OTP input
   */
  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Check if pasted data is 4 digits
    if (/^\d{4}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      
      // Focus last input
      otpInputRefs.current[3]?.focus();
      
      // Auto-verify
      handleVerifyOtp(pastedData);
    }
  };

  /**
   * Verify OTP code
   */
  const handleVerifyOtp = async (code?: string) => {
    const otpCode = code || otp.join("");
    
    if (otpCode.length !== 4) {
      setError("Please enter all 4 digits");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await loginWithOtp(email, otpCode);
      onSuccess();
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(
        err instanceof Error && err.message.includes("401")
        ? "Invalid or expired code. Please try again."
        : "Verification failed. Please try again."
      );
      // Clear OTP inputs on error
      setOtp(["", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Resend OTP code
   */
  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    setOtp(["", "", "", ""]);
    handleSendOtp();
  };

  /**
   * Go back to email input
   */
  const handleBackToEmail = () => {
    setStep("email");
    setOtp(["", "", "", ""]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "email" ? (
          // Email Input Step
          <motion.div
            key="email-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0f5a1f] focus:ring-2 focus:ring-[#0f5a1f]/20 outline-none transition-all"
                  disabled={isSendingOtp}
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={isSendingOtp || !email}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0f5a1f] text-white font-semibold hover:bg-[#0d4e1b] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Verification Code
                </>
              )}
            </button>
          </motion.div>
        ) : (
          // OTP Input Step
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">
                We sent a code to <span className="font-semibold text-gray-900">{email}</span>
              </p>
              <button
                onClick={handleBackToEmail}
                className="text-xs text-[#0f5a1f] hover:underline mt-1"
              >
                Change email
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter 4-digit code
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-gray-200 focus:border-[#0f5a1f] focus:ring-2 focus:ring-[#0f5a1f]/20 outline-none transition-all"
                    disabled={isVerifying}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => handleVerifyOtp()}
              disabled={isVerifying || otp.some((digit) => digit === "")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0f5a1f] text-white font-semibold hover:bg-[#0d4e1b] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Verify Code
                </>
              )}
            </button>

            <div className="text-center">
              <button
                onClick={handleResendOtp}
                disabled={resendCountdown > 0}
                className="text-sm text-gray-600 hover:text-[#0f5a1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCountdown > 0
                  ? `Resend code in ${resendCountdown}s`
                  : "Resend code"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}

