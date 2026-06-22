"use client";

// Navbar: fixed top navigation with smooth scrolling
// Edit tips:
// - Logo image: change `src` at <Image src="/logos/navbar.png" />
// - Link labels/targets: edit items in the Center Links <ul>
// - Background on scroll: tweak classes in header className (bg-*, border-*, backdrop-blur)
// - CTA button: edit text/color in the Right CTA Link (style backgroundColor and inner text)

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false); // toggles scrolled styles once page is offset
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // controls mobile menu visibility
  const [showUserMenu, setShowUserMenu] = useState(false); // controls user dropdown menu
  
  // Auth state
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={
        `fixed top-0 inset-x-0 z-50 transition-colors duration-300` +
        ` ${isScrolled ? "bg-white/6 border-b border-black/10 backdrop-blur-md dark:bg-black/30 dark:border-white/10" : "bg-transparent"}`
      }
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Link 
            href="/"
            aria-label="GameGrid Home" 
            className="inline-flex items-center"
          >
            <Image
              src="/logos/navbar.png" // swap this path to change the navbar logo
              alt="GameGrid navbar logo"
              width={124}
              height={124}
              priority
            />
          </Link>
        </div>

        {/* Center: Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-bold text-foreground/90">
          <li>
            <Link 
              href="/"
              className="hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm transition-opacity duration-200"
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              href="/founders"
              className="hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm transition-opacity duration-200"
            >
              The Founders
            </Link>
          </li>
          {/* TEMPORARILY COMMENTED OUT - Pricing not ready yet
          <li>
            <Link 
              href="#pricing"
              className="hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm transition-opacity duration-200"
            >
              Pricing
            </Link>
          </li>
          */}
        </ul>

        {/* Right: CTA & Mobile Menu Button */}
        <div className="flex items-center gap-4">
          {/* Auth Button - Login or User Menu */}
          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                // Logged in - show user menu
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition-all duration-200 hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0f5a1f] flex items-center justify-center text-white text-xs font-bold">
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden lg:inline text-gray-700">
                      {user.firstName || user.email?.split("@")[0]}
                    </span>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-100 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Not logged in - show login button
                <Link
                  href="/login"
                  className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:shadow-md hover:scale-105"
                  style={{ backgroundColor: "#0f5a1f" }}
                >
                  Login
                </Link>
              )}
            </>
          )}
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-green-50"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-green-700" />
            ) : (
              <Menu className="h-6 w-6 text-green-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 top-18 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            
            {/* Menu Content */}
            <motion.div 
              className="relative bg-white/95 backdrop-blur-md border-b border-black/10 shadow-lg"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <motion.ul 
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.1
                      }
                    }
                  }}
                >
                  <motion.li
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      visible: { y: 0, opacity: 1 }
                    }}
                  >
                    <Link 
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-left px-4 py-3 text-lg font-bold text-foreground/90 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      Home
                    </Link>
                  </motion.li>
                  <motion.li
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      visible: { y: 0, opacity: 1 }
                    }}
                  >
                    <Link 
                      href="/founders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-left px-4 py-3 text-lg font-bold text-foreground/90 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      The Founders
                    </Link>
                  </motion.li>
                  {/* TEMPORARILY COMMENTED OUT - Pricing not ready yet
                  <motion.li
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      visible: { y: 0, opacity: 1 }
                    }}
                  >
                    <Link 
                      href="#pricing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-left px-4 py-3 text-lg font-bold text-foreground/90 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      Pricing
                    </Link>
                  </motion.li>
                  */}
                  {/* Auth Section in Mobile Menu */}
                  <motion.li 
                    className="pt-4 border-t border-black/10"
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      visible: { y: 0, opacity: 1 }
                    }}
                  >
                    {!isLoading && (
                      <>
                        {isAuthenticated && user ? (
                          // Logged in - show user info and logout
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 px-4 py-2">
                              <div className="w-10 h-10 rounded-full bg-[#0f5a1f] flex items-center justify-center text-white font-bold">
                                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <Link
                              href="/dashboard"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block w-full text-center rounded-full px-6 py-3 text-lg font-bold text-white transition-all duration-200 hover:shadow-md"
                              style={{ backgroundColor: "#0f5a1f" }}
                            >
                              Dashboard
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="block w-full text-center rounded-full px-6 py-3 text-lg font-bold text-red-600 border-2 border-red-200 bg-red-50 transition-all duration-200 hover:bg-red-100"
                            >
                              Sign Out
                            </button>
                          </div>
                        ) : (
                          // Not logged in - show login button
                          <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block w-full text-center rounded-full px-6 py-3 text-lg font-bold text-white transition-all duration-200 hover:shadow-md"
                            style={{ backgroundColor: "#0f5a1f" }}
                          >
                            Login
                          </Link>
                        )}
                      </>
                    )}
                  </motion.li>
                </motion.ul>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
