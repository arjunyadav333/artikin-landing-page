import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CursorGlow from "@/components/careers/CursorGlow";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 pt-20">
      <CursorGlow />
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl hidden lg:block z-10 border-4 border-white"
      >
        <img src="/careers/artist_1.png" alt="Artist" className="w-full h-full object-cover" />
      </motion.div>
      
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-10 w-56 h-72 rounded-2xl overflow-hidden shadow-2xl hidden lg:block z-10 border-4 border-white"
      >
        <img src="/careers/artist_2.png" alt="Workspace" className="w-full h-full object-cover" />
      </motion.div>

      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-8">
            Build the Future of the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">Creative Industry</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#0F172A]/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join Artikin and help millions of artists discover opportunities, showcase talent, and grow their careers. We're building the infrastructure for the global creative economy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Open Roles
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-[#0F172A]/10 hover:bg-[#F8FAFC] rounded-full px-8 h-14 text-lg font-semibold transition-all hover:scale-105 active:scale-95"
            >
              Life at Artikin
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-t from-[#2563FF]/10 to-transparent z-0" />
    </section>
  );
};

export default Hero;
