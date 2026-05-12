import React, { useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import MinimalHero from "@/components/careers/MinimalHero";
import BenefitsGrid from "@/components/careers/BenefitsGrid";
import JobList from "@/components/careers/JobList";
import LifeAtArtikin from "@/components/careers/LifeAtArtikin";
import GlobalImpact from "@/components/careers/GlobalImpact";
import FAQ from "@/components/careers/FAQ";
import FinalCTA from "@/components/careers/FinalCTA";
import CursorGlow from "@/components/careers/CursorGlow";

const Careers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative bg-white selection:bg-primary/10 selection:text-primary min-h-screen">
      <CursorGlow />
      <Header isScrolled={true} />
      
      <main>
        <MinimalHero />
        <BenefitsGrid />
        <JobList />
        <LifeAtArtikin />
        <GlobalImpact />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};

export default Careers;
