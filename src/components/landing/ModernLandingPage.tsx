import React, { lazy, Suspense } from "react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { ContentSpinner } from "@/components/ui/loading-spinner";
import Header from "./Header";
import HeroSection from "./HeroSection";

// Lazy load sections for better performance
const BlueHighlightSection = lazy(() => import("./BlueHighlightSection"));
const ArtFormsCarousel = lazy(() => import("./ArtFormsCarousel"));
const WhatIsArtikin = lazy(() => import("./WhatIsArtikin"));
const WhyArtistsChoose = lazy(() => import("./WhyArtistsChoose"));
const FinalCTA = lazy(() => import("./FinalCTA"));
const Footer = lazy(() => import("./Footer"));

const ModernLandingPage = () => {
  // Initialize scroll restoration hook
  useScrollRestoration();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <Suspense fallback={<ContentSpinner />}>
          <WhatIsArtikin />
          <BlueHighlightSection />
          <ArtFormsCarousel />
          <WhyArtistsChoose />
          <FinalCTA />
        </Suspense>
      </main>
      <Suspense fallback={<ContentSpinner />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default ModernLandingPage;