import React, { lazy, Suspense, useState, useEffect } from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";

// Lazy load non-critical sections
const BlueHighlightSection = lazy(() => import("./BlueHighlightSection"));
const HowItWorks = lazy(() => import("./HowItWorks"));
const ArtFormsCarousel = lazy(() => import("./ArtFormsCarousel"));
const WhatIsArtikin = lazy(() => import("./WhatIsArtikin"));
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

  return (
    <div className="min-h-screen bg-white">
      <Header isScrolled={isScrolled} isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />
      <main>
        <HeroSection isScrolled={isScrolled} isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />
        <Suspense fallback={<SectionLoader />}>
          <WhatIsArtikin />
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