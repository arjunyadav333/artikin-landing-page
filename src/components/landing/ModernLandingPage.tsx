import React, { lazy, Suspense } from "react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import Header from "./Header";
import HeroSection from "./HeroSection";

// Lazy load non-critical sections
const BlueHighlightSection = lazy(() => import("./BlueHighlightSection"));
const ArtFormsCarousel = lazy(() => import("./ArtFormsCarousel"));
const WhatIsArtikin = lazy(() => import("./WhatIsArtikin"));
const WhyArtistsChoose = lazy(() => import("./WhyArtistsChoose"));
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
  // Initialize scroll restoration hook
  useScrollRestoration();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionLoader />}>
          <WhatIsArtikin />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <BlueHighlightSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ArtFormsCarousel />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <WhyArtistsChoose />
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