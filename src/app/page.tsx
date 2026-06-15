"use client";

// Home page: combines hero, features, sports sliders, pricing, and footer
// Edit tips:
// - Hero rotating words: edit `words` array
// - Hero images: swap `/logos/gamegrid-logo.png` and `/section-1/gg-phones.png`
// - Features: change props passed to <FeatureCard/> and its images
// - Integrations marquee: tune <CurvedIconMarqueeCard/> props
// - Sports slider: update `sportsImages` list
// - Metrics slider: update `placeholderCards` list
// - Pricing: adjust <PricingCard/> props, features, and default `yearly` state
// - Footer: update links and logo
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Twitter, Instagram, Linkedin } from "lucide-react";
import Navbar from "@/components/custom/Navbar";
import { getBasePath } from "@/lib/basePath";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/appStoreLinks";
// Removed Swiper - using pure CSS marquee

export default function Home() {
  const words = useMemo(() => ["EASY.", "FUN.", "EFFICIENT."], []); // rotating hero words
  const [index, setIndex] = useState(0);
  // Pricing toggle state
  const [yearly, setYearly] = useState(false); // set true to default to yearly pricing
  // Page state management
  const [currentPage, setCurrentPage] = useState<'home' | 'founders'>('home');
  const [foundersAnimationKey, setFoundersAnimationKey] = useState(0);

  // Reset scroll position when changing pages, but allow for delayed scrolling to sections
  const [targetSection, setTargetSection] = useState<string | null>(null);
  
  // NOTE [STATIC-ONLY WORKAROUND]:
  // This file contains a few URL/History workarounds to support deep linking when hosted as a static site (GitHub Pages):
  // 1) popstate handler (below) that interprets /founders and /pricing paths
  // 2) one-time redirect param handler for "?redirect=founders"
  // 3) hash-based handler for "#pricing" to enable direct scroll from /pricing static entry
  // When migrating to a non-static host like Railway (Node server enabled), you can:
  // - Remove the redirect/hash handlers entirely (they exist only because static hosting cannot run Next.js rewrites)
  // - Keep or simplify popstate (optional). With real routing (app router or middleware/rewrites), these can be replaced by native navigation
  // - Delete the public/founders and public/pricing HTML redirect files (they won't be needed with server rewrites)
  
  useEffect(() => {
    console.log('useEffect triggered - currentPage:', currentPage, 'targetSection:', targetSection);
    
    if (currentPage === 'home' && targetSection) {
      // Wait for the page transition animation to complete before scrolling
      const scrollTimer = setTimeout(() => {
        const elementId = targetSection.replace('#', '');
        const element = document.getElementById(elementId);
        
        console.log('Looking for element with ID:', elementId, 'Found:', element);
        
        if (element) {
          // Smooth scroll to the target section after transition
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log('Smooth scrolling to element:', element);
          setTargetSection(null); // Clear target section after scrolling
        } else {
          console.log('Element not found:', elementId, 'Available IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
          setTargetSection(null);
        }
      }, 700); // Wait for transition to complete (600ms transition + 100ms buffer)
      
      return () => clearTimeout(scrollTimer);
    } else if (currentPage === 'founders') {
      console.log('On founders page, scrolling to top');
      window.scrollTo(0, 0);
    }
  }, [currentPage, targetSection]);

  // Navigation handler for navbar links
  const handleNavigation = (sectionId: string) => {
    console.log('handleNavigation called with:', sectionId, 'current page:', currentPage);
    
    if (currentPage === 'founders') {
      // Leaving founders: update URL and return to home, optionally targeting a section
      console.log('Setting target section from founders to:', sectionId);
      if (sectionId === '#home') {
        window.history.pushState({ page: 'home' }, '', '/');
        setCurrentPage('home');
        setTimeout(() => window.scrollTo(0, 0), 300);
      } else if (sectionId === '#pricing') {
        window.history.pushState({ page: 'pricing' }, '', '/pricing');
        setTargetSection(sectionId);
        setCurrentPage('home');
      }
    } else {
      // Already on home: scroll to section and update URL
      if (sectionId === '#home') {
        window.history.pushState({ page: 'home' }, '', '/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (sectionId === '#pricing') {
        window.history.pushState({ page: 'pricing' }, '', '/pricing');
        const element = document.getElementById(sectionId.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 1600);
    return () => clearInterval(id);
  }, [words.length]);

  // Sync URL <-> internal state for founders and pricing using History API without changing functionality
  useEffect(() => {
    const onPopState = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      if (path === '/founders' || path === '/founders/') {
        setCurrentPage('founders');
        setFoundersAnimationKey((prev) => prev + 1);
      } else if (path === '/pricing' || path === '/pricing/') {
        setCurrentPage('home');
        setTargetSection('#pricing');
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', onPopState);
    // Initialize state from current URL on first mount
    onPopState();
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Handle redirect parameter from static pages (GitHub Pages workaround)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    
    // Only handle redirects on initial page load, not during navigation
    if (redirect === 'founders') {
      // Replace URL to /founders and trigger founders page
      window.history.replaceState({ page: 'founders' }, '', '/founders');
      setCurrentPage('founders');
      setFoundersAnimationKey((prev) => prev + 1);
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  // Handle hash-based navigation for pricing section
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#pricing') {
        // Update URL to clean /pricing path and scroll to section
        window.history.replaceState({ page: 'pricing' }, '', '/pricing');
        setCurrentPage('home');
        setTimeout(() => {
          const element = document.getElementById('pricing');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Check hash on initial load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      {/* Navigation */}
      <Navbar 
        onFoundersClick={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({ page: 'founders' }, '', '/founders');
          }
          setCurrentPage('founders');
          setFoundersAnimationKey(prev => prev + 1);
        }}
        onNavigate={handleNavigation}
        currentPage={currentPage}
      />
      
      {/* Page Content with Conditional Rendering */}
      <AnimatePresence mode="wait">
        {currentPage === 'home' ? (
          <motion.div
            key="home"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200, duration: 0.6 }}
          >
            <HomeContent 
              words={words}
              index={index}
              yearly={yearly}
              setYearly={setYearly}
              onFoundersClick={() => {
                if (typeof window !== 'undefined') {
                  window.history.pushState({ page: 'founders' }, '', '/founders');
                }
                setCurrentPage('founders');
                setFoundersAnimationKey(prev => prev + 1);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="founders"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200, duration: 0.6 }}
          >
            <FoundersPage onBack={() => { if (typeof window !== 'undefined' && window.location.pathname === '/founders') { window.history.back(); } else if (typeof window !== 'undefined') { window.history.replaceState({}, '', '/'); } setCurrentPage('home'); }} animationKey={foundersAnimationKey} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Home page content component
function HomeContent({ words, index, yearly, setYearly, onFoundersClick }: { 
  words: string[]; 
  index: number; 
  yearly: boolean; 
  setYearly: (value: boolean) => void; 
  onFoundersClick: () => void;
}) {
  return (
      <main id="home" className="pt-28 sm:pt-32">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12">
          {/* Left: Logo + Title */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36">
              <Image
                src={getBasePath("/logos/gamegrid-logo.png")}
                alt="GameGrid logo"
                fill
                priority
                className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              />
            </div>
            <h1
              className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-gamegrid-title)" }}
            >
              PLAYING IN LEAGUES
              <br />
              HAS NEVER BEEN THIS
              <br />
              <span className="inline-block align-baseline relative h-[1.2em] w-[11ch] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={words[index]}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="absolute left-0 right-0 top-0 w-full text-center text-green-700"
                  >
                    {words[index]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
          </div>

          {/* Right: Phones visual (swap src to change image) */}
          <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[560px]">
            <Image
              src={getBasePath("/section-1/gg-phones.png")}
              alt="GameGrid mobile previews"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>




      {/* Section 2: Four Feature Cards (edit FeatureCard props to change content) */}
      <section className="w-full mt-14 sm:mt-20 px-[1px] sm:px-[1px] lg:px-[2px]" id="features">
        <header className="text-center mb-10 sm:mb-14">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-gamegrid-title)" }}
          >
            ONE STOP SHOP FOR <br className="hidden sm:block" /> ALL YOUR SPORTS LEAGUES
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] sm:gap-[2px] lg:gap-[3px] min-h-screen">
          {/* Column 1 (left, slightly higher) */}
          <div className="grid grid-rows-2 gap-[2px] sm:gap-[2px] content-stretch">
            <FeatureCard
              title="Real-Time Stat Engine"
              description="Instant, Accurate, Game-Changing. Track every bucket, goal, and stat in real time with our lightning-fast engine, built to keep players and leagues in sync without the mess."
              highlights={["Engine"]}
              imageSrc={getBasePath("/section-2/ipad-mockup.png")}
              imageAlt="iPad mockup with stat engine"
              loading="eager"
            />
            <FeatureCard
              title="Player Dashboard"
              description="Know Your Game. And Everyone Else's. Players get full access to their performance history, live updates, and league-wide insights, so you're never out of the loop."
              imageSrc={getBasePath("/section-2/player-dashboard.png")}
              imageAlt="Player dashboard mockup"
              loading="lazy"
              imagePosition="bottom"
              imageTiltDeg={-6}
            />
          </div>

          {/* Column 2 (right, offset lower). Adjust translate-y utilities to shift group vertically */}
          <div className="grid grid-rows-2 gap-[2px] sm:gap-[2px] content-stretch translate-y-20 sm:translate-y-28 lg:translate-y-32">
            <FeatureCard
              title="Strategy Hub"
              description="Plan. Execute. Dominate. Set weekly game plans, coordinate with your squad, and make every possession/play count because strategy wins games."
              imageSrc={getBasePath("/section-2/strategy-hub.png")}
              imageAlt="Strategy hub mockup"
              loading="lazy"
              imagePosition="bottom"
            />
            <CurvedIconMarqueeCard />
          </div>
        </div>
      </section>

      {/* Section 3: Quote and Image Sliders (update lists in SportsImageSlider/PlaceholderCardsSlider) */}
      <section className="w-full mt-52 sm:mt-64 lg:mt-72" id="sports">
        {/* Quote */}
        <header className="text-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight leading-tight max-w-5xl mx-auto"
              style={{ fontFamily: "var(--font-gamegrid-title)" }}
            >
              &ldquo;Built for the grind. Engineered for every game. Fueled by competition. Powered by GameGrid.&rdquo;
            </h2>
          </div>
        </header>

        {/* Top Large Image Slider - Full Width */}
        <div className="mb-1 sm:mb-1">
          <SportsImageSlider />
        </div>

        {/* Bottom Smaller Cards Slider - Full Width */}
        <div>
          <PlaceholderCardsSlider />
        </div>
      </section>

            {/* TEMPORARILY COMMENTED OUT - Pricing not ready yet
            <section id="pricing" className="w-full mt-48 sm:mt-64 lg:mt-80 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="text-center mb-8 sm:mb-12">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-gamegrid-title)" }}
            >
              ONE PLAN, TOTAL ACCESS
            </h2>

            <BillingToggle yearly={yearly} setYearly={setYearly} />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <PricingCard
              tier="CORE"
              price={35}
              yearlyPrice={30}
              yearly={yearly}
              blurb="For leagues just starting out or managing smaller rosters."
              features={[
                "Full access to all GameGrid features",
                "Up to 8 teams",
                "1 active league",
                "Complete stat tracking, schedules, standings, and rosters",
                "Game logs and player profile pages",
                "Standard email support",
              ]}
            />
            <PricingCard
              tier="ELITE"
              price={55}
              yearlyPrice={50}
              yearly={yearly}
              blurb="For organizations managing multiple leagues and divisions."
              features={[
                "Full access to all GameGrid features",
                "Unlimited teams",
                "1 active league",
                "Cross-league stat tracking and shared leaderboards",
                "League-wide announcements, awards, and admin dashboards",
                "Premium support with Slack/Discord integration",
              ]}
            />
            <PricingCard
              tier="TOURNAMENT"
              customPricing="$100"
              customPricingUnit="/event"
              blurb="Built for one-time competitions, weekend tournaments, and showcase events."
              variant="green"
              features={[
                "Run one tournament with complete access",
                "Unlimited teams and flexible bracket options",
                "Real-time stat entry and automated leaderboards",
                "Team and player profile tracking",
                "Exportable reports and standard email support",
              ]}
            />
            <PricingCard
              tier="ENTERPRISE"
              customPricing="CUSTOM"
              customPricingUnit=""
              blurb="Tailored solutions for large organizations, schools, and national league systems."
              variant="green"
              features={[
                "Custom team and league limits",
                "White-label branding and platform configuration",
                "API integrations and external system sync",
                "Multi-admin access and audit tracking",
                "Dedicated onboarding, training, and account management",
              ]}
            />
          </div>
        </div>
      </section>
      */}
      {/* Footer (update logo path and link URLs) */}
      <footer className="w-full mt-28 sm:mt-36 border-t border-black/10 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <Image
                src={getBasePath("/logos/navbar.png")}
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
                  <button 
                    onClick={onFoundersClick}
                    className="hover:text-white transition-colors text-left"
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
    </main>
  );
}

// Founders Full Page Component
function FoundersPage({ onBack, animationKey }: { onBack: () => void; animationKey: number }) {

  const foundersData = [
    {
      id: 1,
      name: "Bilaal Asghar",
      title: "Co-Founder",
      bio: "Business Technology Analyst at Deloitte, driving GameGrid’s product design and scalable workflows to make league management effortless.",
      image: getBasePath("/founders/bilal.png"),
    },
    {
      id: 2,
      name: "Waleed Tariq",
      title: "Co-Founder", 
      bio: "Division I Athlete and Captain, creator of GameGrid’s analytics engine, transforming raw data into advanced player performance insights.",
      image: getBasePath("/founders/waleed.png"),
    },
    {
      id: 3,
      name: "Zarir Hamza",
      title: "Co-Founder",
      bio: "Software Engineer at Datadog, leading GameGrid’s entire tech stack to ensure a reliable, scalable, and future-ready multi-sport platform.",
      image: getBasePath("/founders/zarir.png"),
    },
  ];



  return (
      <main className="bg-white pt-28 sm:pt-32">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <motion.button
            onClick={onBack}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 text-[#0f5a1f] hover:text-[#0d4e1b] font-medium mb-8 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Home
          </motion.button>
          
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
              key={`founder-${founder.id}-${animationKey}`} // Force remount with animation key
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
                key={`bio-container-${founder.id}-${animationKey}`} // Force remount
                initial={{ 
                  opacity: 0, 
                  // Left (index 0): from right diagonal (current)
                  // Right (index 2): from left diagonal  
                  // Middle (index 1): from bottom up
                  x: index === 0 ? -30 : index === 2 ? 30 : 0,
                  y: index === 1 ? 40 : 30
                }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ 
                  // Left first (1.2s), Right second (1.6s), Middle last (2.0s)
                  delay: index === 0 ? 1.2 : index === 2 ? 1.6 : 2.0,
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth movement
                }}
                className="overflow-hidden"
              >
                <motion.p 
                  key={`bio-text-${founder.id}-${animationKey}`} // Force remount
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
      </main>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // shared card primitives
import CurvedIconMarquee from "@/components/custom/CurvedIconMarquee";

function FeatureCard({ title, description, highlights = [], imageSrc, imageAlt, imagePosition = "center", imageTiltDeg, loading = "lazy" }: { title: string; description: string; highlights?: string[]; imageSrc?: string; imageAlt?: string; imagePosition?: "center" | "bottom"; imageTiltDeg?: number; loading?: "lazy" | "eager" }) {
  const renderHighlightedTitle = (text: string) => {
    const parts = text.split(/(\s+)/);
    return (
      <>
        {parts.map((p, i) => {
          const key = p.replace(/[^a-z0-9]/gi, "").toLowerCase();
          const match = highlights.some((h) => h.toLowerCase() === key);
          return (
            <span key={`${p}-${i}`} className={match ? "text-[#0f5a1f]" : undefined}>{p}</span>
          );
        })}
      </>
    );
  };
  if (imagePosition === "bottom") {
    return (
      <div className="bg-black text-white border border-white/10 rounded-3xl overflow-hidden flex flex-col">
        <div className="text-center pt-10 pb-10 px-6">
          <motion.h3
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ fontFamily: "var(--font-gamegrid-title)" }}
            className="text-white text-3xl sm:text-4xl tracking-tight font-semibold"
          >
            {renderHighlightedTitle(title)}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="mt-4 text-base sm:text-lg leading-relaxed text-white/80 text-center mx-auto max-w-md"
          >
            {description}
          </motion.p>
        </div>
        <div className="flex-1 relative">
          {imageSrc ? (
            <div
              className="absolute left-1/2 top-1/2 h-64 sm:h-80 w-full"
              style={{ transform: `translate(-50%, -60%) rotate(${imageTiltDeg ?? 6}deg)` }}
            >
              <Image 
                src={imageSrc} 
                alt={imageAlt || title} 
                fill 
                className="object-contain" 
                loading={loading}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-black text-white border-white/10 rounded-3xl">
      <CardHeader className="text-center pt-10 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <CardTitle style={{ fontFamily: "var(--font-gamegrid-title)" }} className="text-white text-3xl sm:text-4xl tracking-tight">
            {renderHighlightedTitle(title)}
          </CardTitle>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
        >
          <CardDescription className="mt-4 text-base sm:text-lg leading-relaxed text-white/80 text-center mx-auto max-w-md">
            {description}
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-12">
        {imageSrc ? (
          <div className="relative h-60 sm:h-[22rem] w-full rounded-xl overflow-hidden rotate-[-6deg]">
            <Image 
              src={imageSrc} 
              alt={imageAlt || title} 
              fill 
              className="object-contain" 
              loading={loading}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="h-60 sm:h-[22rem] w-full rounded-xl" />
        )}
      </CardContent>
    </Card>
  );
}

function CurvedIconMarqueeCard() {
  return (
    <Card className="bg-black text-white border-white/10 rounded-3xl">
      <CardHeader className="text-center pt-10 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <CardTitle style={{ fontFamily: "var(--font-gamegrid-title)" }} className="text-white text-3xl sm:text-4xl tracking-tight">
            POWERED BY YOUR <span className="text-[#0f5a1f]">FAVORITES</span>
          </CardTitle>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
        >
          <CardDescription className="mt-2 text-base sm:text-lg leading-relaxed text-white/80 text-center mx-auto max-w-md">
            Seamlessly connect with tools you already use. More integrations on the way.
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-8">
        <div className="relative rounded-2xl overflow-hidden mt-10 w-full">
          <CurvedIconMarquee
            height={400}
            radius={600}
            arc={90}
            speed={22}
            gap={18}
            inset={220}
            offsetY={300}
            responsive={[
              { max: 640, settings: { height: 260, radius: 400, arc: 120, iconSize: 70, gap: 14, inset: 100, offsetY: 380, speed: 30 } },
              { min: 641, max: 1024, settings: { height: 320, radius: 500, arc: 100, iconSize: 86, gap: 14, inset: 180, offsetY: 400, speed: 30 } },
              { min: 1025, max: 1920, settings: { height: 400, radius: 600, arc: 120, iconSize: 112, gap: 18, inset: 240, offsetY: 550, speed: 30 } },
              { min: 1920, max: 2560, settings: { height: 460, radius: 680, arc: 120, iconSize: 120, gap: 20, inset: 320, offsetY: 550, speed: 30 } },
            ]}
          />

          {/* Overlay CTA: button + email input. Does not interfere with marquee (marquee track has pointer-events:none) */}
          <div className="pointer-events-auto absolute inset-x-0 bottom-6 sm:bottom-8 flex flex-col items-center gap-3 z-10">
            <button
              type="button"
              className="rounded-full bg-[#0f5a1f] hover:bg-[#0d4e1b] text-white px-6 sm:px-8 py-3 sm:py-3.5 shadow-lg text-sm sm:text-base font-bold"
            >
              Get On The Waitlist
            </button>
            <div className="w-[90%] sm:w-[70%] md:w-[60%] lg:w-[40%]">
              <label htmlFor="waitlist-email" className="sr-only">Email address</label>
              <input
                id="waitlist-email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                className="w-full rounded-full bg-white/90 text-black placeholder-black/60 px-5 py-3 sm:py-3.5 shadow focus:outline-none focus:ring-2 focus:ring-[#0f5a1f]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Billing toggle component (Monthly / Yearly)
function BillingToggle({ yearly, setYearly }: { yearly: boolean; setYearly: (v: boolean) => void }) {
  return (
    <div className="mt-6 flex justify-center">
      <div className="relative inline-flex items-center rounded-full bg-neutral-200/80 dark:bg-white/10 px-1 py-1 w-72">
        <button
          onClick={() => setYearly(false)}
          className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${!yearly ? 'text-black' : 'text-black/60'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setYearly(true)}
          className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${yearly ? 'text-black' : 'text-black/60'}`}
        >
          Yearly
        </button>
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow transition-transform duration-300 ${yearly ? 'translate-x-[calc(100%+0.5rem)]' : 'translate-x-0'}`}
        />
      </div>
    </div>
  );
}

type PricingCardProps = {
  tier: 'CORE' | 'PLUS' | 'ELITE' | 'TOURNAMENT' | 'ENTERPRISE';
  price?: number;
  yearlyPrice?: number;
  yearly?: boolean;
  blurb: string;
  features: string[];
  variant?: 'default' | 'green';
  customPricing?: string;
  customPricingUnit?: string;
};

function PricingCard({ tier, price, yearlyPrice, yearly, blurb, features, variant = 'default', customPricing, customPricingUnit }: PricingCardProps) {
  const shown = yearly && yearlyPrice ? yearlyPrice : price;
  const isGreen = variant === 'green';
  
  // Dynamic classes based on variant
  const containerClasses = isGreen 
    ? "rounded-2xl border border-[#0f5a1f]/20 bg-[#0f5a1f] p-6 sm:p-8 flex flex-col shadow-sm max-w-[360px] sm:max-w-[380px] w-full mx-auto min-h-[520px] sm:min-h-[560px] shadow-[0_0_40px_rgba(15,90,31,0.7)] hover:shadow-[0_0_60px_rgba(15,90,31,0.8)] transition-shadow duration-300"
    : "rounded-2xl border border-black/10 bg-white p-6 sm:p-8 flex flex-col shadow-sm max-w-[360px] sm:max-w-[380px] w-full mx-auto min-h-[520px] sm:min-h-[560px]";
  
  const tierClasses = isGreen ? "text-white/90 font-bold text-sm tracking-wide" : "text-[#0f5a1f] font-bold text-sm tracking-wide";
  const priceClasses = isGreen ? "text-4xl sm:text-5xl font-extrabold text-white" : "text-4xl sm:text-5xl font-extrabold";
  const unitClasses = isGreen ? "text-sm font-medium text-white/70 mb-1" : "text-sm font-medium text-black/60 mb-1";
  const buttonClasses = isGreen ? "mt-4 inline-flex w-full justify-center rounded-full bg-white text-[#0f5a1f] font-semibold py-2.5 text-sm hover:opacity-90" : "mt-4 inline-flex w-full justify-center rounded-full bg-black text-white font-semibold py-2.5 text-sm hover:opacity-90";
  const dividerClasses = isGreen ? "h-px w-full bg-white/20 my-3" : "h-px w-full bg-black/10 my-3";
  const blurbClasses = isGreen ? "text-base sm:text-lg font-semibold text-white mb-3" : "text-base sm:text-lg font-semibold text-black mb-3";
  const featureTextClasses = isGreen ? "flex items-start gap-2 text-sm text-white/90" : "flex items-start gap-2 text-sm text-black/80";
  const checkClasses = isGreen ? "h-5 w-5 mt-0.5 text-white flex-shrink-0" : "h-5 w-5 mt-0.5 text-[#0f5a1f] flex-shrink-0";

  return (
    <div className={containerClasses}>
      <div className="mb-4">
        <div className={tierClasses}>{tier}</div>
        <motion.div layout className="mt-0 flex items-end gap-1 min-h-[4rem] sm:min-h-[5rem]">
          {customPricing ? (
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={customPricing === 'CUSTOM' ? (isGreen ? "text-lg font-medium text-white/60 flex items-end" : "text-lg font-medium text-gray-500 flex items-end") : priceClasses}
            >
              {customPricing}
            </motion.div>
          ) : (
            <motion.div
              key={shown}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={priceClasses}
            >
              ${shown}
            </motion.div>
          )}
          <div className={unitClasses}>{customPricingUnit || (customPricing === 'CUSTOM' ? '' : '/month')}</div>
        </motion.div>
        <a 
          href={tier === 'ENTERPRISE' ? 'https://calendly.com/gamegrid/30min' : 'https://calendly.com/gamegrid/30min'}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses}
        >
          {tier === 'ENTERPRISE' ? 'Get in touch with sales' : 'Book a demo'}
        </a>
      </div>

      <div className={dividerClasses}/>

      <div>
        <div className={blurbClasses} style={{ fontFamily: 'var(--font-gamegrid-title)' }}>
          {blurb}
        </div>
        <ul className="space-y-3">
          {features.map((f, i) => (
            <li key={i} className={featureTextClasses}>
              <Check className={checkClasses}/>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
// Sports Image Slider Component - Pure CSS marquee with navigation
function SportsImageSlider() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClickPaused, setIsClickPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tickerInitedRef = useRef(false);
  const xRef = useRef(0);
  const cycleWidthRef = useRef(0);
  const hoveredRef = useRef(false);
  const clickPausedRef = useRef(false);
  const navTweenRef = useRef<gsap.core.Tween | null>(null);
  
  // Touch handling refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  
  const sportsImages = [ // swap image src/title/alt to change slides
    { src: getBasePath("/section-3/basketball.jpeg"), alt: "Basketball Game", title: "Basketball" },
    { src: getBasePath("/section-3/football.jpg"), alt: "Football Game", title: "Football" },
    { src: getBasePath("/section-3/pickleball.jpg"), alt: "Pickleball Game", title: "Pickleball" },
    { src: getBasePath("/section-3/Soccer.jpg"), alt: "Soccer Game", title: "Soccer" },
  ];

  // Duplicate exactly twice for seamless -50% translation
  const baseImages = sportsImages;
  const duplicatedImages = [...baseImages, ...baseImages]; // needed for seamless wrap

  // Detect if device is primarily touch-based (mobile/tablet, not hybrid laptops)
  useEffect(() => {
    const checkTouchDevice = () => {
      // Touch capability detection
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Mobile/tablet user agent detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Screen size detection
      const isSmallScreen = window.innerWidth <= 1024; // tablets and phones
      
      // Desktop OS detection (to exclude touch laptops)
      const isDesktopOS = /Windows NT|Macintosh|Linux/i.test(navigator.userAgent) && !isMobile;
      
      // Determine if it's a touch device
      // TRUE if: (has touch AND (is mobile OR small screen)) AND NOT desktop OS with large screen
      const touchResult = hasTouch && (isMobile || isSmallScreen) && !(isDesktopOS && window.innerWidth > 1024);
      

      
      setIsTouchDevice(touchResult);
    };
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // Measure one full cycle width (one set of items)
  useEffect(() => {
    const track = containerRef.current;
    if (!track) return;
    const measure = () => {
      if (track.children.length < baseImages.length) return;
      const first = track.children[0] as HTMLElement;
      const last = track.children[baseImages.length - 1] as HTMLElement;
      const cycle = last.offsetLeft + last.offsetWidth - first.offsetLeft;
      cycleWidthRef.current = cycle;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [baseImages.length]);

  // GSAP ticker for continuous motion (rightward)
  useEffect(() => {
    hoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    clickPausedRef.current = isClickPaused;
  }, [isClickPaused]);

  useEffect(() => {
    if (tickerInitedRef.current) return;
    tickerInitedRef.current = true;
    const track = containerRef.current;
    if (!track) return;
    xRef.current = -0.001; // start slightly negative to enable wrapping
    gsap.set(track, { x: xRef.current });
    const speedPxPerSec = 60; // top row speed
    const update = () => {
      const cycle = cycleWidthRef.current;
      if (!cycle) return;
      if (hoveredRef.current || clickPausedRef.current) return;
      const delta = gsap.ticker.deltaRatio();
      const dx = (speedPxPerSec / 60) * delta; // pixels/frame at 60fps
      xRef.current += dx; // move right
      if (xRef.current >= 0) {
        xRef.current -= cycle;
      }
      gsap.set(track, { x: xRef.current });
    };
    gsap.ticker.add(update);
    return () => { gsap.ticker.remove(update); };
  }, []);

  const animateCenterToIndex = (index: number) => {
    const track = containerRef.current;
    if (!track) return;
    const baseCount = baseImages.length;
    // choose item from the 2nd set for stability
    const target = (track.children[baseCount + index] as HTMLElement) || (track.children[index] as HTMLElement);
    if (!target) return;
    
    // Force layout calculation to ensure accurate measurements
    target.getBoundingClientRect();
    
    // Get viewport and container measurements

    const containerElement = track.parentElement;
    if (!containerElement) return;
    
    // Get the container's actual width and position
    const containerBounds = containerElement.getBoundingClientRect();
    const containerWidth = containerBounds.width;
    
    // Get slide measurements
    const slideWidth = target.offsetWidth;
    const targetLeft = target.offsetLeft;
    
    // Calculate perfect centering: slide center should align with container center
    // This ensures the full slide is visible and properly centered
    let desiredX = (containerWidth / 2) - (slideWidth / 2) - targetLeft;
    
    // Ensure slide stays within bounds (safety check)
    const maxLeftPosition = 0;
    const minLeftPosition = containerWidth - slideWidth;
    const slideLeftPosition = targetLeft + desiredX;
    
    if (slideLeftPosition > maxLeftPosition) {
      desiredX = maxLeftPosition - targetLeft;
    } else if (slideLeftPosition < minLeftPosition) {
      desiredX = minLeftPosition - targetLeft;
    }
    
    // Handle cycle wrapping for seamless scrolling
    const cycle = cycleWidthRef.current;
    if (cycle > 0) {
      // Normalize within cycle bounds - ensure we stay within one cycle
      while (desiredX > 0) {
        desiredX -= cycle;
      }
      while (desiredX <= -cycle) {
        desiredX += cycle;
      }
    }
    
    if (navTweenRef.current) navTweenRef.current.kill();
    navTweenRef.current = gsap.to(track, {
      x: desiredX,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => { 
        xRef.current = (gsap.getProperty(track, 'x') as number) || desiredX; 
      },
      onComplete: () => { 
        xRef.current = desiredX; 
      }
    });
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % sportsImages.length;
    setCurrentIndex(nextIndex);
    setIsClickPaused(true);
    animateCenterToIndex(nextIndex);
    setTimeout(() => { if (!hoveredRef.current) setIsClickPaused(false); }, 1500);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + sportsImages.length) % sportsImages.length;
    setCurrentIndex(prevIndex);
    setIsClickPaused(true);
    animateCenterToIndex(prevIndex);
    setTimeout(() => { if (!hoveredRef.current) setIsClickPaused(false); }, 1500);
  };

  // Touch event handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isDraggingRef.current = false;
    setIsClickPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDevice || !touchStartRef.current) return;
    const touch = e.touches[0];
    touchMoveRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // If horizontal movement is greater than vertical, it's a swipe
    if (deltaX > deltaY && deltaX > 10) {
      isDraggingRef.current = true;
      e.preventDefault(); // Prevent scrolling
    }
  };

  const handleTouchEnd = () => {
    if (!isTouchDevice || !touchStartRef.current || !touchMoveRef.current) {
      touchStartRef.current = null;
      touchMoveRef.current = null;
      isDraggingRef.current = false;
      return;
    }

    const deltaX = touchMoveRef.current.x - touchStartRef.current.x;
    const deltaY = Math.abs(touchMoveRef.current.y - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Determine if it's a valid swipe (horizontal movement > 50px, time < 500ms, horizontal > vertical)
    if (Math.abs(deltaX) > 50 && deltaTime < 500 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        handlePrev(); // Swipe right = previous
      } else {
        handleNext(); // Swipe left = next
      }
    }

    // Reset touch tracking
    touchStartRef.current = null;
    touchMoveRef.current = null;
    isDraggingRef.current = false;
    setTimeout(() => { if (!isDraggingRef.current) setIsClickPaused(false); }, 300);
  };

  return (
    <div 
      className={`relative w-full marquee marquee-sports`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Arrows - Only show on non-touch devices */}
      {isHovered && !isTouchDevice && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#0f5a1f] hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#0f5a1f] hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </>
      )}

      {/* Marquee Track - duplicate the sequence twice */}
      <div className="marquee-track">
        <div ref={containerRef} className="flex space-x-1.5 overflow-x-auto scrollbar-hide">
          {duplicatedImages.map((image, index) => (
            <div key={`${image.title}-${index}`} className="flex-shrink-0">
              <div className="relative h-[16rem] sm:h-[24rem] lg:h-[36rem] xl:h-[40rem] w-[320px] sm:w-[960px] lg:w-[1120px] xl:w-[1280px] rounded-2xl overflow-hidden group cursor-pointer">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4 right-24 sm:top-6 sm:left-6 sm:right-40">
                  <h3
                    className="text-white text-2xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight"
                    style={{ fontFamily: "var(--font-gamegrid-title)" }}
                  >
                    {image.title}
                  </h3>
                </div>
                <button
                  type="button"
                  className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full bg-white text-black font-bold px-4 py-2 shadow-md hover:shadow-lg transition-shadow"
                >
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Placeholder Cards Slider Component - Pure CSS marquee with navigation
function PlaceholderCardsSlider() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClickPaused, setIsClickPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tickerInitedRef = useRef(false);
  const xRef = useRef(0);
  const cycleWidthRef = useRef(0);
  const hoveredRef = useRef(false);
  const clickPausedRef = useRef(false);
  const navTweenRef = useRef<gsap.core.Tween | null>(null);
  
  // Touch handling refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  
  const placeholderCards = [ // update metric/title/description per card
    {
      id: 1,
      metric: "+100,000",
      title: "Stats Expected in Year One",
      description: "Tracks stats across local leagues, tournaments, and rec teams in real time.",
    },
    {
      id: 2,
      metric: "10,000+",
      title: "Players Projected",
      description: "Forecasted to serve over 10K players, giving each one visibility, rankings, and season stats.",
    },
    {
      id: 3,
      metric: "70%",
      title: "Faster League Management",
      description: "Beta testers report setting teams, schedules, and rosters 70% faster than traditional methods like spreadsheets and group chats.",
    },
    {
      id: 4,
      metric: "500+",
      title: "Leagues Targeted",
      description: "Working with community leaders and organizers to bring GameGrid to 500+ active leagues in basketball, soccer, and volleyball.",
    },
    {
      id: 5,
      metric: "40%",
      title: "Higher Player Retention (Pilot Data)",
      description: "Leagues using our beta tools saw improved attendance and return rate—players stay engaged when their performance is tracked.",
    },
    {
      id: 6,
      metric: "94%",
      title: "Beta User Satisfaction",
      description: "In early trials, 94% of admins and players said they’d use GameGrid again, citing speed, simplicity, and stat accuracy.",
    },
    // The following two are placeholders to maintain 8 cards, update when new metrics are available
    {
      id: 7,
      metric: "24/7",
      title: "Real‑Time Availability",
      description: "Always-on stat tracking and standings so players and admins can check updates anytime.",
    },
    {
      id: 8,
      metric: "3+",
      title: "Sports at Launch",
      description: "Focused rollout across basketball, soccer, and volleyball with more sports planned.",
    },
  ];

  // Duplicate exactly twice for seamless -50% translation
  const baseCards = placeholderCards;
  const duplicatedCards = [...baseCards, ...baseCards]; // seamless wrap

  // Detect if device is primarily touch-based (mobile/tablet, not hybrid laptops)
  useEffect(() => {
    const checkTouchDevice = () => {
      // Touch capability detection
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Mobile/tablet user agent detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Screen size detection
      const isSmallScreen = window.innerWidth <= 1024; // tablets and phones
      
      // Desktop OS detection (to exclude touch laptops)
      const isDesktopOS = /Windows NT|Macintosh|Linux/i.test(navigator.userAgent) && !isMobile;
      
      // Determine if it's a touch device
      // TRUE if: (has touch AND (is mobile OR small screen)) AND NOT desktop OS with large screen
      const touchResult = hasTouch && (isMobile || isSmallScreen) && !(isDesktopOS && window.innerWidth > 1024);
      

      
      setIsTouchDevice(touchResult);
    };
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  // measure cycle width
  useEffect(() => {
    const track = containerRef.current;
    if (!track) return;
    const measure = () => {
      if (track.children.length < baseCards.length) return;
      const first = track.children[0] as HTMLElement;
      const last = track.children[baseCards.length - 1] as HTMLElement;
      const cycle = last.offsetLeft + last.offsetWidth - first.offsetLeft;
      cycleWidthRef.current = cycle;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [baseCards.length]);

  useEffect(() => { hoveredRef.current = isHovered; }, [isHovered]);
  useEffect(() => { clickPausedRef.current = isClickPaused; }, [isClickPaused]);

  // GSAP ticker for continuous motion (leftward)
  useEffect(() => {
    if (tickerInitedRef.current) return;
    tickerInitedRef.current = true;
    const track = containerRef.current;
    if (!track) return;
    xRef.current = -cycleWidthRef.current / 2; // start mid-cycle for variety
    gsap.set(track, { x: xRef.current });
    const speedPxPerSec = -40; // bottom row slower and opposite
    const update = () => {
      const cycle = cycleWidthRef.current;
      if (!cycle) return;
      if (hoveredRef.current || clickPausedRef.current) return;
      const delta = gsap.ticker.deltaRatio();
      const dx = (speedPxPerSec / 60) * delta;
      xRef.current += dx; // dx negative -> left
      if (xRef.current <= -cycle) {
        xRef.current += cycle;
      }
      gsap.set(track, { x: xRef.current });
    };
    gsap.ticker.add(update);
    return () => { gsap.ticker.remove(update); };
  }, []);

  const animateCenterToIndex = (index: number) => {
    const track = containerRef.current;
    if (!track) return;
    const baseCount = baseCards.length;
    const target = (track.children[baseCount + index] as HTMLElement) || (track.children[index] as HTMLElement);
    if (!target) return;
    
    // Force layout calculation to ensure accurate measurements
    target.getBoundingClientRect();
    
    // Get viewport and container measurements

    const containerElement = track.parentElement;
    if (!containerElement) return;
    
    // Get the container's actual width and position
    const containerBounds = containerElement.getBoundingClientRect();
    const containerWidth = containerBounds.width;
    
    // Get slide measurements
    const slideWidth = target.offsetWidth;
    const targetLeft = target.offsetLeft;
    
    // Calculate the desired center position
    // We want the slide center to align with the container center
    const containerCenter = containerWidth / 2;
    const slideCenter = slideWidth / 2;
    
    // Calculate desired X position to center the slide
    let desiredX = containerCenter - slideCenter - targetLeft;
    
    // For very large slides that nearly fill the viewport, adjust centering strategy
    const slideToContainerRatio = slideWidth / containerWidth;
    if (slideToContainerRatio > 0.85) {
      // If slide takes up more than 85% of container, use a more conservative centering
      // This helps with xl breakpoint slides (1280px) on smaller viewports
      const availableSpace = containerWidth - slideWidth;
      desiredX = (availableSpace / 2) - targetLeft;
    }
    
    // Handle cycle wrapping for seamless scrolling
    const cycle = cycleWidthRef.current;
    if (cycle > 0) {
      // Normalize within cycle bounds - ensure we stay within one cycle
      while (desiredX > 0) {
        desiredX -= cycle;
      }
      while (desiredX <= -cycle) {
        desiredX += cycle;
      }
    }
    
    if (navTweenRef.current) navTweenRef.current.kill();
    navTweenRef.current = gsap.to(track, {
      x: desiredX,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => { 
        xRef.current = (gsap.getProperty(track, 'x') as number) || desiredX; 
      },
      onComplete: () => { 
        xRef.current = desiredX; 
      }
    });
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % placeholderCards.length;
    setCurrentIndex(nextIndex);
    setIsClickPaused(true);
    animateCenterToIndex(nextIndex);
    setTimeout(() => { if (!hoveredRef.current) setIsClickPaused(false); }, 1500);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + placeholderCards.length) % placeholderCards.length;
    setCurrentIndex(prevIndex);
    setIsClickPaused(true);
    animateCenterToIndex(prevIndex);
    setTimeout(() => { if (!hoveredRef.current) setIsClickPaused(false); }, 1500);
  };

  // Touch event handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isDraggingRef.current = false;
    setIsClickPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDevice || !touchStartRef.current) return;
    const touch = e.touches[0];
    touchMoveRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // If horizontal movement is greater than vertical, it's a swipe
    if (deltaX > deltaY && deltaX > 10) {
      isDraggingRef.current = true;
      e.preventDefault(); // Prevent scrolling
    }
  };

  const handleTouchEnd = () => {
    if (!isTouchDevice || !touchStartRef.current || !touchMoveRef.current) {
      touchStartRef.current = null;
      touchMoveRef.current = null;
      isDraggingRef.current = false;
      return;
    }

    const deltaX = touchMoveRef.current.x - touchStartRef.current.x;
    const deltaY = Math.abs(touchMoveRef.current.y - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Determine if it's a valid swipe (horizontal movement > 50px, time < 500ms, horizontal > vertical)
    if (Math.abs(deltaX) > 50 && deltaTime < 500 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        handlePrev(); // Swipe right = previous
      } else {
        handleNext(); // Swipe left = next
      }
    }

    // Reset touch tracking
    touchStartRef.current = null;
    touchMoveRef.current = null;
    isDraggingRef.current = false;
    setTimeout(() => { if (!isDraggingRef.current) setIsClickPaused(false); }, 300);
  };

  return (
    <div 
      className={`relative w-full marquee marquee-cards`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Arrows - Only show on non-touch devices */}
      {isHovered && !isTouchDevice && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#0f5a1f] hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#0f5a1f] hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </>
      )}

      {/* Marquee Track - duplicate the sequence twice */}
      <div className="marquee-track">
        <div ref={containerRef} className="flex space-x-2">
          {duplicatedCards.map((card, index) => (
            <div key={`${card.id}-${index}`} className="flex-shrink-0">
              <div className="w-[240px] sm:w-[420px]">
                <Card className="h-36 sm:h-60 bg-[#0f5a1f] text-white border-0 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-1 sm:pb-2 sm:px-6">
                    <div
                      className="text-white/90 font-extrabold text-2xl sm:text-5xl leading-none"
                      style={{ fontFamily: '"Satoshi", var(--font-sans)' }}
                    >
                      {card.metric}
                    </div>
                    <CardTitle
                      className="mt-1 text-sm sm:text-2xl font-black uppercase tracking-tight text-white"
                      style={{ fontFamily: 'var(--font-gamegrid-title)' }}
                    >
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="sm:px-6">
                    <CardDescription className="text-[11px] leading-snug sm:text-base font-semibold text-white/85">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
