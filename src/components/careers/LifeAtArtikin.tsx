import React from "react";
import { motion } from "framer-motion";

const LifeAtArtikin = () => {
  const items = [
    { type: "image", src: "/artikin_studio_vibe_1.png", title: "Creative Sanctuary", span: "md:col-span-8 md:row-span-2" },
    { type: "text", title: "Collaboration", desc: "Building together across 12+ timezones.", span: "md:col-span-4 md:row-span-1" },
    { type: "image", src: "/artikin_team_collaboration.png", title: "Team Synergy", span: "md:col-span-4 md:row-span-1" },
    { type: "image", src: "/artikin_studio_flow.png", title: "Studio Flow", span: "md:col-span-3 md:row-span-1" },
    { type: "text", title: "Innovation", desc: "Pushing the boundaries of creative tech.", span: "md:col-span-5 md:row-span-1" },
    { type: "image", src: "/artikin_artist_community.png", title: "Artist Community", span: "md:col-span-4 md:row-span-1" },
  ];

  return (
    <section id="life" className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Inside Artikin</span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-blue-500 mb-0">Our Creative <br /> Ecosystem.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className={`relative overflow-hidden group ${item.span} border border-slate-100 bg-slate-50`}
            >
              {item.type === "image" ? (
                <>
                  <img 
                    src={item.src} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <p className="text-white font-bold text-xl mb-1">{item.title}</p>
                      <div className="h-0.5 w-8 bg-primary" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-10 flex flex-col justify-end bg-slate-50 group-hover:bg-primary transition-colors duration-500">
                  <h3 className="text-3xl font-bold text-slate-900 group-hover:text-white transition-colors mb-4">{item.title}</h3>
                  <p className="text-slate-500 group-hover:text-white/80 transition-colors font-medium leading-relaxed text-sm">{item.desc}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LifeAtArtikin;
