"use client";

/**
 * Authentication Context
 * Manages user authentication state, token storage, and provides auth functions
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import { googleLogin, getUserDetails, verifyOtp, UserData, GoogleLoginResponse } from "./api";

// ============================================
// Types
// ============================================

interface AuthState {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  /** Login with Google OAuth ID token */
  loginWithGoogle: (idToken: string) => Promise<GoogleLoginResponse>;
  /** Login with email OTP */
  loginWithOtp: (email: string, otp: string) => Promise<GoogleLoginResponse>;
  /** Logout and clear all auth state */
  logout: () => void;
  /** Refresh user data from API */
  refreshUser: () => Promise<void>;
}

// ============================================
// Constants
// ============================================

const TOKEN_KEY = "gamegrid_token";
const USER_KEY = "gamegrid_user";

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser) as UserData;
          setState({
            user,
            token: storedToken,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear potentially corrupted data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login with Google OAuth
   * Sends ID token to backend, stores JWT and user data
   */
  const loginWithGoogle = useCallback(async (idToken: string): Promise<GoogleLoginResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await googleLogin(idToken);

      // Store token and user data
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));

      setState({
        user: response.data,
        token: response.accessToken,
        isLoading: false,
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * Login with Email OTP
   * Sends email and OTP to backend, stores JWT and user data
   */
  const loginWithOtp = useCallback(async (email: string, otp: string): Promise<GoogleLoginResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await verifyOtp(email, otp);

      // Store token and user data
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));

      setState({
        user: response.data,
        token: response.accessToken,
        isLoading: false,
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * Logout - clear token and user data
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  /**
   * Refresh user data from API
   * Useful after profile updates
   */
  const refreshUser = useCallback(async () => {
    if (!state.token) {
      throw new Error("No token available");
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await getUserDetails(state.token);

      // Update stored user data
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));

      setState((prev) => ({
        ...prev,
        user: response.data,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error refreshing user:", error);
      // If token is invalid, logout
      if (error instanceof Error && error.message.includes("401")) {
        logout();
      }
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [state.token, logout]);

  // Memoize context value to prevent cascading re-renders.
  // Without this, every AuthProvider render creates a new value reference,
  // which re-renders ALL useAuth() consumers and their entire subtrees.
  const value: AuthContextType = useMemo(() => ({
    ...state,
    loginWithGoogle,
    loginWithOtp,
    logout,
    refreshUser,
  }), [state, loginWithGoogle, loginWithOtp, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get stored token (for use outside of React components)
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user (for use outside of React components)
 */
export function getStoredUser(): UserData | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserData;
  } catch {
    return null;
  }
}

