"use client";

/**
 * DashboardTopBar
 * Horizontal bar at the top of the main content area.
 * Contains a search input (left) and user profile avatar with dropdown (right).
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardTopBar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** First letter of user's name or email for avatar fallback */
  const initials =
    user?.firstName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const profilePicture = user?.playerProfile?.profilePicture;

  return (
    <header className="sticky top-0 z-20 py-4">
      {/* Light gray rounded box - search bar not connected to edges */}
      <div className="rounded-2xl bg-[#EFEFEF] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* ── Search Input: rounded pill, contained within the gray box ── */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-11 rounded-full border-0 bg-white/80 focus:bg-white h-10 shadow-sm"
          />
        </div>

        {/* ── Profile Avatar ── */}
        <div className="relative ml-4" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#0f5a1f]/30"
            aria-label="User menu"
          >
            <Avatar className="w-10 h-10 border-2 border-gray-200">
              {profilePicture && <AvatarImage src={profilePicture} alt="Profile" />}
              <AvatarFallback className="bg-[#0D5A1E] text-white font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User info */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              {/* Menu items */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push("/dashboard/profile");
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                  router.push("/login");
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
        </div>
    </header>
  );
}
