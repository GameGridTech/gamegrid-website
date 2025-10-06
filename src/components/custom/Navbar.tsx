"use client";

// Navbar: fixed top navigation with smooth scrolling
// Edit tips:
// - Logo image: change `src` at <Image src="/logos/navbar.png" />
// - Link labels/targets: edit items in the Center Links <ul> (href="#..." must match section ids)
// - Background on scroll: tweak classes in header className (bg-*, border-*, backdrop-blur)
// - CTA button: edit text/color in the Right CTA Link (style backgroundColor and inner text)

import Image from "next/image";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Menu, X } from "lucide-react";
import { getBasePath } from "@/lib/basePath";
import { AnimatePresence, motion } from "framer-motion";

// Register GSAP ScrollTo plugin for smooth scrolling functionality
gsap.registerPlugin(ScrollToPlugin);

export default function Navbar({ 
  onFoundersClick, 
  onNavigate 
}: { 
  onFoundersClick?: () => void;
  onNavigate?: (sectionId: string) => void;
  currentPage?: 'home' | 'founders';
}) {
  const [isScrolled, setIsScrolled] = useState(false); // toggles scrolled styles once page is offset
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // controls mobile menu visibility

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

  return (
    <header
      className={
        `fixed top-0 inset-x-0 z-50 transition-colors duration-300` +
        ` ${isScrolled ? "bg-white/6 border-b border-black/10 backdrop-blur-md dark:bg-black/30 dark:border-white/10" : "bg-transparent"}`
      }
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">{/* change max width/padding to alter navbar container */}
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <button 
            aria-label="GameGrid Home" 
            className="inline-flex items-center"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('#home');
            }}
          >
            <Image
              src={getBasePath("/logos/navbar.png")} // swap this path to change the navbar logo
              alt="GameGrid navbar logo"
              width={124}
              height={124}
              priority
            />
          </button>
        </div>

        {/* Center: Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-bold text-foreground/90">{/* add/remove <li> to change nav links */}
          <li>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('#home');
              }}
              className="hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm transition-opacity duration-200"
            >
              Home
            </button>
          </li>
          <li>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onFoundersClick?.();
              }}
              className="hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm transition-opacity duration-200"
            >
              The Founders
            </button>
          </li>
          {/* TEMPORARILY COMMENTED OUT - Pricing not ready yet
          <li>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('#pricing');
              }}
              className="hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm transition-opacity duration-200"
            >
              Pricing
            </button>
          </li>
          */}
        </ul>

        {/* Right: CTA & Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <a
            href="https://calendly.com/gamegrid/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:shadow-md hover:scale-105"
            style={{ backgroundColor: "#0f5a1f" }} // change hex to update button color
          >
            Book a Demo {/* edit text for CTA label */}
          </a>
          
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
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false); // close mobile menu
                        onNavigate?.('#home');
                      }}
                      className="block w-full text-left px-4 py-3 text-lg font-bold text-foreground/90 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      Home
                    </button>
                  </motion.li>
                  <motion.li
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      visible: { y: 0, opacity: 1 }
                    }}
                  >
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false); // close mobile menu
                        onFoundersClick?.();
                      }}
                      className="block w-full text-left px-4 py-3 text-lg font-bold text-foreground/90 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      The Founders
                    </button>
                  </motion.li>
                  {/* TEMPORARILY COMMENTED OUT - Pricing not ready yet
                  <motion.li
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      visible: { y: 0, opacity: 1 }
                    }}
                  >
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false); // close mobile menu
                        onNavigate?.('#pricing');
                      }}
                      className="block w-full text-left px-4 py-3 text-lg font-bold text-foreground/90 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      Pricing
                    </button>
                  </motion.li>
                  */}
                  <motion.li 
                    className="pt-4 border-t border-black/10"
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      visible: { y: 0, opacity: 1 }
                    }}
                  >
                    <a
                      href="https://calendly.com/gamegrid/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileMenuOpen(false)} // close mobile menu
                      className="block w-full text-center rounded-full px-6 py-3 text-lg font-bold text-white transition-all duration-200 hover:shadow-md"
                      style={{ backgroundColor: "#0f5a1f" }}
                    >
                      Book a Demo
                    </a>
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


