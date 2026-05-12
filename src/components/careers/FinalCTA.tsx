import React from "react";
import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="w-full bg-gradient-to-r from-blue-600 to-blue-400 py-12 relative overflow-hidden">
      {/* Subtle Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 -translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Ready to build the future?
          </h2>
          <p className="text-blue-50 font-medium text-sm md:text-base">
            Join the global team at Artikin and empower millions of creators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button 
            className="w-full sm:w-auto bg-white text-blue-600 hover:bg-slate-50 rounded-none px-8 h-12 font-bold transition-all text-sm uppercase tracking-widest"
            onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Roles
          </button>
          <button 
            className="w-full sm:w-auto border border-white/40 text-white hover:bg-white/10 rounded-none px-8 h-12 font-bold transition-all text-sm uppercase tracking-widest"
          >
            Talent Network
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
