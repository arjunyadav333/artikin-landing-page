import React from "react";
import LegalHeader from "@/components/landing/LegalHeader";
import LegalFooter from "@/components/landing/LegalFooter";
import { Users, Target, Rocket, Heart } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-700">
      <LegalHeader />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <header className="text-center mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              About <span className="text-[#0073cf]">Artikin</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              At Artikin, we're on a mission to bridge the gap between creative excellence and professional opportunity. 
              We believe every artist deserves a stage, and every organization deserves the best talent.
            </p>
          </header>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-[#0073cf] rounded-2xl flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                To empower artists worldwide by providing a professional platform where they can showcase their unique voice, 
                collaborate with peers, and connect with global opportunities.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-[#0073cf] rounded-2xl flex items-center justify-center mb-6">
                <Rocket size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To become the world's most trusted ecosystem for the creative economy, where art meets technology to 
                redefine professional networking for the next generation.
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-100 mb-20">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-bold text-slate-900">The Artikin Story</h2>
                <p className="text-slate-600 leading-relaxed">
                  Artikin was born from a simple observation: artists often struggle to find professional platforms 
                  that truly understand their needs. Most career sites are built for corporate roles, while social 
                  media platforms prioritize vanity metrics over professional growth.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  We built Artikin to be different. A place where your portfolio is your resume, and your 
                  creative journey is celebrated. Today, we're proud to support thousands of creators 
                  across diverse art forms, from digital illustrators to traditional sculptors.
                </p>
              </div>
              <div className="flex-1 w-full h-[400px] overflow-hidden rounded-2xl shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" 
                  alt="Artists Collaboration" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Why Artikin */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-12">Why We Do What We Do</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="text-4xl font-extrabold text-[#0073cf]">Empowerment</div>
                <p className="text-slate-600">Giving creators the tools to succeed on their own terms.</p>
              </div>
              <div className="space-y-4">
                <div className="text-4xl font-extrabold text-[#0073cf]">Community</div>
                <p className="text-slate-600">Fostering a supportive environment for collaboration.</p>
              </div>
              <div className="space-y-4">
                <div className="text-4xl font-extrabold text-[#0073cf]">Innovation</div>
                <p className="text-slate-600">Pushing the boundaries of how art is discovered.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
};

export default AboutUs;
