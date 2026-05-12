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
    <section id="impact" className="py-40 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-full bg-white/5 skew-x-12 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 mb-24">
          <div className="max-w-3xl">
            <span className="text-white/60 font-bold tracking-[0.3em] uppercase text-xs mb-6 block">Your Potential Impact</span>
            <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
              Join the Mission to <br />
              Empower the World.
            </h2>
            <p className="text-xl text-blue-50 font-medium leading-relaxed max-w-2xl">
              At Artikin, your contributions directly shape the economic future of the global creative industry. Build the infrastructure that connects millions.
            </p>
          </div>
          <div className="hidden lg:block w-px h-64 bg-white/10" />
          <div className="lg:max-w-xs">
             <div className="text-8xl font-black text-white mb-4">80%</div>
             <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
               Increase in creative opportunities facilitated through Artikin last year.
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 shadow-2xl">
           {impacts.map((item, idx) => (
             <motion.div 
               key={idx} 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="p-12 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-500 group border-b md:border-b-0 md:border-r border-white/5"
             >
                <div className="text-4xl font-black text-white mb-8">{item.stat}</div>
                <h3 className="text-2xl font-bold text-white mb-6 group-hover:translate-x-2 transition-transform">{item.title}</h3>
                <p className="text-blue-50/70 font-medium leading-relaxed text-sm">
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
