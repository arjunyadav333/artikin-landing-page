import React from "react";
import { motion } from "framer-motion";

const GlobalImpact = () => {
  const impacts = [
    { 
      title: "Scale for Millions", 
      desc: "Architect systems that support over 1 million creative professionals globally.",
      stat: "1M+" 
    },
    { 
      title: "Global Connectivity", 
      desc: "Connect talent from 120+ countries with world-class opportunities.",
      stat: "120+" 
    },
    { 
      title: "Economic Empowerment", 
      desc: "Drive the creation of 50k+ jobs and studio partnerships every year.",
      stat: "50k+" 
    }
  ];

  return (
    <section className="py-32 bg-slate-900 px-6 relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 mb-24">
          <div className="max-w-2xl">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-6 block">Your Potential Impact</span>
            <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-8">
              Join the Mission to <br />
              <span className="text-primary">Empower Artists.</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              At Artikin, your code and designs directly shape the economic future of the global creative industry. Build the infrastructure that connects millions to their next big opportunity.
            </p>
          </div>
          <div className="hidden lg:block w-px h-64 bg-slate-800" />
          <div className="lg:max-w-xs">
             <div className="text-7xl font-bold text-white mb-4">80%</div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs leading-relaxed">
               Increase in creative opportunities facilitated through Artikin last year.
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800 border border-slate-800 shadow-2xl">
           {impacts.map((item, idx) => (
             <motion.div 
               key={idx} 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="p-12 bg-slate-900 hover:bg-black transition-all duration-500 group"
             >
                <div className="text-4xl font-bold text-primary mb-8">{item.stat}</div>
                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed text-sm">
                  {item.desc}
                </p>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalImpact;
