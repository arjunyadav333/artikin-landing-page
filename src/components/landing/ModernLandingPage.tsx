import React, { lazy, Suspense, useState, useEffect } from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";

// Lazy load non-critical sections
const BlueHighlightSection = lazy(() => import("./BlueHighlightSection"));
const HowItWorks = lazy(() => import("./HowItWorks"));
const ArtFormsCarousel = lazy(() => import("./ArtFormsCarousel"));
const WhatIsArtikin = lazy(() => import("./WhatIsArtikin"));
const Mission = lazy(() => import("./Mission"));
const WhyArtistsChoose = lazy(() => import("./WhyArtistsChoose"));
const Testimonials = lazy(() => import("./Testimonials"));
const FAQ = lazy(() => import("./FAQ"));
const FinalCTA = lazy(() => import("./FinalCTA"));
const Footer = lazy(() => import("./Footer"));

// Lightweight loading placeholder
const SectionLoader = () => (
  <div className="py-16 sm:py-20 lg:py-24">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
    </div>
  </div>
);

const ModernLandingPage = React.memo(() => {
  const [isMuted, setIsMuted] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection - shared between Header and HeroSection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force scroll to top on mount / reload
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Scroll to hash on load or URL hash change
  useEffect(() => {
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        // Delay to allow lazy loaded modules to render
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          // Clear the hash from the URL after triggering scroll
          window.history.replaceState(null, '', window.location.pathname);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [window.location.hash]);

  return (
    <div className="min-h-screen bg-white">
      <Header isScrolled={isScrolled} isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />
      <main>
        <HeroSection isScrolled={isScrolled} isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />
        <Suspense fallback={<SectionLoader />}>
          <WhatIsArtikin />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Mission />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <BlueHighlightSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ArtFormsCarousel />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <WhyArtistsChoose />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FinalCTA />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
});

ModernLandingPage.displayName = "ModernLandingPage";

export default ModernLandingPage;