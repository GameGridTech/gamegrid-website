"use client";

/**
 * Founders page: showcases the GameGrid founding team
 * Converted from embedded SPA component to proper Next.js route
 */
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, Instagram, Linkedin } from "lucide-react";

// Founders data
const foundersData = [
  {
    id: 1,
    name: "Bilaal Asghar",
    title: "Co-Founder",
    bio: "Business Technology Analyst at Deloitte, driving GameGrid's product design and scalable workflows to make league management effortless.",
    image: "/founders/bilal.png",
  },
  {
    id: 2,
    name: "Waleed Tariq",
    title: "Co-Founder", 
    bio: "Division I Athlete and Captain, creator of GameGrid's analytics engine, transforming raw data into advanced player performance insights.",
    image: "/founders/waleed.png",
  },
  {
    id: 3,
    name: "Zarir Hamza",
    title: "Co-Founder",
    bio: "Software Engineer at Datadog, leading GameGrid's entire tech stack to ensure a reliable, scalable, and future-ready multi-sport platform.",
    image: "/founders/zarir.png",
  },
];

export default function FoundersPage() {
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key="founders"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white pt-28 sm:pt-32"
      >
        {/* Header */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[#0f5a1f] hover:text-[#0d4e1b] font-medium mb-8 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Home
              </Link>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "var(--font-gamegrid-title)" }}
            >
              The Founders
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              The team behind GameGrid&apos;s mission to revolutionize grassroots sports
            </motion.p>
          </div>
        </section>

        {/* Co-Founders Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {foundersData.map((founder, index) => (
              <motion.div
                key={`founder-${founder.id}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-gamegrid-title)" }}>
                  {founder.name}
                </h3>
                <p className="text-[#0f5a1f] font-medium mb-4 text-lg">
                  {founder.title}
                </p>
                {/* Bio reveals with position-specific animations */}
                <motion.div
                  key={`bio-container-${founder.id}`}
                  initial={{ 
                    opacity: 0, 
                    x: index === 0 ? -30 : index === 2 ? 30 : 0,
                    y: index === 1 ? 40 : 30
                  }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ 
                    delay: index === 0 ? 1.2 : index === 2 ? 1.6 : 2.0,
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="overflow-hidden"
                >
                  <motion.p 
                    key={`bio-text-${founder.id}`}
                    className="text-gray-600 leading-relaxed"
                    initial={{ 
                      opacity: 0, 
                      x: index === 0 ? -20 : index === 2 ? 20 : 0,
                      y: index === 1 ? 30 : 20
                    }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ 
                      delay: index === 0 ? 1.4 : index === 2 ? 1.8 : 2.2,
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                  >
                    {founder.bio}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="p-8 sm:p-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-[#0f5a1f]" style={{ fontFamily: "var(--font-gamegrid-title)" }}>
              Our Story: From Players to Builders
            </h2>
            <div className="text-gray-600 leading-relaxed text-lg max-w-4xl mx-auto space-y-6">
              <p>
                We&apos;re three co-founders: <span className="font-bold text-[#0f5a1f]">Bilaal Asghar</span>, <span className="font-bold text-[#0f5a1f]">Waleed Tariq</span>, and <span className="font-bold text-[#0f5a1f]">Zarir Hamza</span> who&apos;ve spent most of our lives in New Jersey. We met in college and bonded through what brought us all to the same place: sports, competition, and the love for the game.
              </p>
              
              <p>
                From running pickup runs to organizing full leagues, we lived through the chaos—lost stats, messy schedules, teams scrambling last minute, and no real way to track your performance unless someone remembered to keep score. It felt like for all the effort players were putting in, there was nothing built for us. Nothing that matched our grind.
              </p>
              
              <p>
                That&apos;s when we decided to stop waiting and build it ourselves.
              </p>
              
              <p>
                We created GameGrid not just as an app, but as a platform. A clean, powerful, easy-to-use engine to run your league, track every stat, manage teams, and give players the recognition they earn on the court, field, turf, or wherever they compete. No fluff. No overcomplication. Just the tools athletes actually need to keep the game organized, competitive, and real.
              </p>
              
              <p>
                Right now, it might look like it started with basketball—but this is bigger than one sport. GameGrid is built to power every game, every team, and every league we can reach. Whether it&apos;s football, soccer, volleyball, basketball, cricket, or anything in between, our mission is to bring structure, stats, and spotlight to players everywhere, nationally and globally.
              </p>
              
              <p>
                We didn&apos;t come from big tech companies. We came from the courts, the group chats, and the weekend leagues where reputations are made bucket by bucket, goal by goal, point by point. <span className="font-bold text-[#0f5a1f]">That&apos;s why GameGrid hits different because it&apos;s made by the same people it&apos;s made for.</span>
              </p>
              
              <p>
                What started in Jersey is just the beginning.
              </p>
              
              <p className="font-bold text-[#0f5a1f] text-xl mt-8">
                Built for the grind. Made for the game.
              </p>
              
              <p className="font-bold text-[#0f5a1f] text-xl">
                This is GameGrid.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="w-full mt-28 sm:mt-36 border-t border-black/10 bg-black text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <Image
                  src="/logos/navbar.png"
                  alt="GameGrid logo"
                  width={120}
                  height={120}
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
                    <span className="text-white/60 cursor-default">
                      The Founders
                    </span>
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
                  <li>For iPhone <span className="text-white/50">(Soon)</span></li>
                  <li>For Android <span className="text-white/50">(Soon)</span></li>
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
                    <Link 
                      href="/contact" 
                      className="hover:text-white transition-colors"
                    >
                      Contact Us
                    </Link>
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
                      <Twitter className="w-4 h-4" />
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
                      <Instagram className="w-4 h-4" />
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
                      <Linkedin className="w-4 h-4" />
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
      </motion.main>
    </AnimatePresence>
  );
}


