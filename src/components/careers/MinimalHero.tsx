import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";

const MinimalHero = () => {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden bg-white">
      {/* Background Abstract Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] max-w-5xl"
          >
            Empower the World's <br />
            <span className="text-blue-500">Creative Economy.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-3xl text-slate-500 max-w-3xl mb-16 leading-relaxed font-medium"
          >
            We're building the professional network for artists. Join us in our mission to connect every creator with their next big opportunity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-12 h-16 text-xl font-bold shadow-2xl shadow-primary/20"
              onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Open Roles
            </Button>
            <button 
              className="group flex items-center gap-2 text-slate-900 font-bold text-lg hover:text-primary transition-colors"
              onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Why Artikin?
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default MinimalHero;
