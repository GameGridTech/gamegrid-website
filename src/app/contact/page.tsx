'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

/**
 * Contact Us page for GameGrid
 * Simple contact page with company email and professional design
 */
export default function ContactPage() {
  return (
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
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

          {/* Links Section */}
          <motion.div 
            className="mt-16 pt-8 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">
              Explore GameGrid
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {/* Demo Link */}
              <div className="text-center p-6 bg-[#0f5a1f] rounded-lg">
                <h4 className="font-bold text-white mb-2">See It In Action</h4>
                <a 
                  href="https://calendly.com/gamegrid/30min" 
                  className="text-white hover:text-white/80 underline font-bold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a Demo
                </a>
              </div>

              {/* Social Links */}
              <div className="text-center p-6 bg-[#0f5a1f] rounded-lg">
                <h4 className="font-bold text-white mb-2">Follow Us</h4>
                <div className="space-y-1">
                  <a 
                    href="http://x.com/gamegridtech" 
                    className="block text-white hover:text-white/80 font-bold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter/X
                  </a>
                  <a 
                    href="https://www.instagram.com/gamegridtech/" 
                    className="block text-white hover:text-white/80 font-bold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                  <a 
                    href="https://www.linkedin.com/company/gamegridtech/" 
                    className="block text-white hover:text-white/80 font-bold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>

              {/* Legal */}
              <div className="text-center p-6 bg-[#0f5a1f] rounded-lg">
                <h4 className="font-bold text-white mb-2">Legal</h4>
                <Link 
                  href="/privacy" 
                  className="text-white hover:text-white/80 underline font-bold"
                >
                  Terms & Privacy
                </Link>
              </div>

              {/* Company */}
              <div className="text-center p-6 bg-[#0f5a1f] rounded-lg">
                <h4 className="font-bold text-white mb-2">Company</h4>
                <div className="space-y-1">
                  <Link 
                    href="/#home" 
                    className="block text-white hover:text-white/80 font-bold"
                  >
                    About GameGrid
                  </Link>
                  <button 
                    onClick={() => window.location.href = '/#founders'}
                    className="block text-white hover:text-white/80 font-bold"
                  >
                    The Founders
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
