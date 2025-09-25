import React from "react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import Header from "./Header";
import HeroSection from "./HeroSection";
import BlueHighlightSection from "./BlueHighlightSection";
import ArtFormsCarousel from "./ArtFormsCarousel";
import WhatIsArtikin from "./WhatIsArtikin";
import WhyArtistsChoose from "./WhyArtistsChoose";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

const ModernLandingPage = () => {
  // Initialize scroll restoration hook
  useScrollRestoration();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <BlueHighlightSection />
        <ArtFormsCarousel />
        <WhatIsArtikin />
        <WhyArtistsChoose />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default ModernLandingPage;