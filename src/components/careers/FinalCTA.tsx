import React from "react";
import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="bg-slate-900 py-20 w-full">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="text-center md:text-left max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to build the <span className="text-primary">future?</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg md:text-xl">
            Join the global team at Artikin and empower millions of creators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <Button 
            className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 rounded-none px-8 h-12 font-bold transition-all text-sm uppercase tracking-widest"
            onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Roles
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 rounded-none px-8 h-12 font-bold transition-all text-sm uppercase tracking-widest"
          >
            Talent Network
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
