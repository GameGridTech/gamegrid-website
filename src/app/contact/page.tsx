'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/appStoreLinks';

/**
 * Contact Us page for GameGrid
 * Simple contact page with company email and professional design
 */
export default function ContactPage() {
  return (
    <AnimatePresence mode="wait">
      <div className="min-h-screen bg-white">
      {/* Header with back link */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <motion.main 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200, duration: 0.6 }}
      >
        <div className="text-center">
          <h1 
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'var(--font-gamegrid-title)' }}
          >
            Contact Us
          </h1>

          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Have questions about GameGrid? Want to learn more about our sports league management platform? 
            We&apos;d love to hear from you!
          </p>

          {/* Contact Form in Green Box */}
          <motion.div 
            className="max-w-5xl mx-auto bg-[#0f5a1f] rounded-2xl p-8 shadow-lg text-white"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 
              className="text-2xl font-semibold text-white mb-2 text-center"
              style={{ fontFamily: 'var(--font-gamegrid-title)' }}
            >
              Get In Touch
            </h2>

            <p className="text-center text-white/80 mb-2">
              <strong>Email us directly:</strong> 
              <a 
                href="mailto:gamegridllc@gmail.com"
                className="text-white underline hover:text-white/80 ml-2"
              >
                gamegridllc@gmail.com
              </a>
            </p>

            <p className="text-center text-white/80 mb-8">
              Or send us a message using the form below
            </p>

            {/* Contact Form */}
            <form 
              action="mailto:gamegridllc@gmail.com" 
              method="post" 
              encType="text/plain"
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    placeholder="What's this about?"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-white text-[#0f5a1f] px-8 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </form>
          </motion.div>

        </div>
      </motion.main>

      {/* Footer */}
      <footer className="w-full border-t border-black/10 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="space-y-4">
                  <img
                    src="/logos/navbar.png"
                    alt="GameGrid logo"
                    className="h-16 w-auto"
                  />
                  <p className="text-white/70 text-sm max-w-xs">
                    GameGrid — built for the grind, engineered for every game.
                  </p>
                </div>

                {/* Company */}
                <div>
                  <h4
                    className="text-white text-lg font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-gamegrid-title)' }}
                  >
                    Company
                  </h4>
                  <ul className="space-y-3 text-white/80 text-sm">
                    <li>
                      <a 
                        href="https://calendly.com/gamegrid/30min" 
                        className="hover:text-white transition-colors" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Schedule Meeting
                      </a>
                    </li>
                    <li>
                      <button 
                        onClick={() => {
                          // STATIC-ONLY WORKAROUND
                          // For static hosting (GitHub Pages), we simulate navigating to Founders
                          // by sending the user back to the SPA root and programmatically
                          // triggering the "The Founders" navigation after a small delay.
                          // On Railway or any server platform with proper rewrites, replace
                          // this entire block with: router.push('/founders') or <Link href="/founders" />
                          window.location.href = '/';
                          setTimeout(() => {
                            const foundersButtons = document.querySelectorAll('button');
                            for (const button of foundersButtons) {
                              if (button.textContent?.includes('Founders') || button.textContent?.includes('founders')) {
                                button.click();
                                break;
                              }
                            }
                          }, 500);
                        }}
                        className="hover:text-white transition-colors text-left bg-transparent border-none p-0"
                      >
                        The Founders
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Downloads */}
                <div>
                  <h4
                    className="text-white text-lg font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-gamegrid-title)' }}
                  >
                    Downloads
                  </h4>
                  <ul className="space-y-3 text-white/80 text-sm">
                    <li>
                      <a
                        href={APP_STORE_URL}
                        className="hover:text-white transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        For iPhone
                      </a>
                    </li>
                    <li>
                      <a
                        href={PLAY_STORE_URL}
                        className="hover:text-white transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        For Android
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4
                    className="text-white text-lg font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-gamegrid-title)' }}
                  >
                    Legal
                  </h4>
                  <ul className="space-y-3 text-white/80 text-sm">
                                    <li>
                  <Link 
                    href="/privacy" 
                    className="hover:text-white transition-colors"
                  >
                    Terms & Privacy Policy
                  </Link>
                </li>
                <li>
                  <span className="text-white/60 cursor-default">
                    Contact Us
                  </span>
                </li>
                  </ul>
                </div>

                {/* Socials */}
                <div>
                  <h4
                    className="text-white text-lg font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-gamegrid-title)' }}
                  >
                    Socials
                  </h4>
                  <ul className="space-y-3 text-white/80 text-sm">
                    <li>
                      <a 
                        href="http://x.com/gamegridtech" 
                        className="hover:text-white flex items-center gap-2 transition-colors" 
                        aria-label="Twitter / X"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Twitter/X
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://www.instagram.com/gamegridtech/" 
                        className="hover:text-white flex items-center gap-2 transition-colors" 
                        aria-label="Instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.33-1.297C4.303 14.894 3.8 13.743 3.8 12.446s.504-2.448 1.318-3.33c.883-.807 2.033-1.297 3.33-1.297s2.448.49 3.33 1.297c.814.883 1.318 2.033 1.318 3.33s-.504 2.448-1.318 3.33c-.883.807-2.033 1.297-3.33 1.297zm7.718-1.426c-.814.883-2.033 1.297-3.33 1.297s-2.448-.49-3.33-1.297c-.814-.883-1.318-2.033-1.318-3.33s.504-2.448 1.318-3.33c.883-.807 2.033-1.297 3.33-1.297s2.448.49 3.33 1.297c.814.883 1.318 2.033 1.318 3.33s-.504 2.447-1.318 3.33z"/>
                        </svg>
                        Instagram
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://www.linkedin.com/company/gamegridtech/" 
                        className="hover:text-white flex items-center gap-2 transition-colors" 
                        aria-label="LinkedIn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

          <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/50">
            © {new Date().getFullYear()} GameGrid. All rights reserved.
          </div>
        </div>
      </footer>
      </div>
    </AnimatePresence>
  );
}
