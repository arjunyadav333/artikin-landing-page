import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";

import actingSlide from "@/assets/acting-slide.jpg";
import danceSlide from "@/assets/dance-slide.jpg";
import modelingSlide from "@/assets/modeling-slide.jpg";
import photographySlide from "@/assets/photography-slide.jpg";
import videographySlide from "@/assets/videography-slide.jpg";
import instrumentalistSlide from "@/assets/instrumentalist-slide.jpg";
import singerSlide from "@/assets/singer-slide.jpg";
import drawingSlide from "@/assets/drawing-slide.jpg";
import paintingSlide from "@/assets/painting-slide.jpg";

const artforms = [
  { id: 1, title: "Acting", description: "Bringing stories to life on stage and screen.", imagePath: actingSlide, color: "from-blue-600/80" },
  { id: 2, title: "Dancer", description: "Expressing emotion through rhythm and movement.", imagePath: danceSlide, color: "from-purple-600/80" },
  { id: 3, title: "Model", description: "Creative presence and professional posing.", imagePath: modelingSlide, color: "from-indigo-600/80" },
  { id: 4, title: "Photographer", description: "Capturing stories and beauty through a lens.", imagePath: photographySlide, color: "from-sky-600/80" },
  { id: 5, title: "Videographer", description: "Visual storytelling and cinematic memories.", imagePath: videographySlide, color: "from-cyan-600/80" },
  { id: 6, title: "Musician", description: "Deep emotion through instrumental skill.", imagePath: instrumentalistSlide, color: "from-blue-700/80" },
  { id: 7, title: "Singer", description: "The voice as a powerful artistic instrument.", imagePath: singerSlide, color: "from-blue-500/80" },
  { id: 8, title: "Artist", description: "Traditional and digital drawing & painting.", imagePath: drawingSlide, color: "from-slate-600/80" },
];

const ArtFormsCarousel = memo(() => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center tracking-tight text-blue-500">
            Explore Art Forms
          </h2>
          <p className="text-slate-600 mt-6 text-lg text-center max-w-2xl mx-auto font-medium">
            Discover a diverse community of creators across multiple disciplines, each bringing a unique perspective to the Artikin ecosystem.
          </p>
          <div className="w-24 h-1 bg-blue-500/20 mt-8 rounded-full" />
        </div>

        {/* Desktop Expanding Deck */}
        <div className="hidden lg:flex gap-4 h-[600px] w-full max-w-[1400px] mx-auto">
          {artforms.map((art) => (
            <motion.div
              key={art.id}
              onMouseEnter={() => setHoveredId(art.id)}
              onMouseLeave={() => setHoveredId(null)}
              animate={{
                flex: hoveredId === art.id ? 4 : (hoveredId === null ? 1 : 0.8),
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl shadow-blue-900/5 border border-white/20"
            >
              {/* Background Image */}
              <motion.img
                src={art.imagePath}
                alt={art.title}
                className="absolute inset-0 w-full h-full object-cover"
                animate={{
                  scale: hoveredId === art.id ? 1.05 : 1,
                  filter: hoveredId === art.id ? "brightness(1.1) contrast(1.1)" : "brightness(0.8) contrast(1)",
                }}
                transition={{ duration: 0.6 }}
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${art.color} via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white overflow-hidden">
                  <AnimatePresence>
                    {hoveredId === art.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="relative z-10"
                      >
                        <motion.div className="flex items-center mb-2">
                          <h3 className="text-3xl font-bold tracking-tight whitespace-nowrap">
                            {art.title}
                          </h3>
                        </motion.div>
                        
                        <p className="text-blue-50 text-lg leading-snug mb-6 max-w-xs font-medium">
                          {art.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>

              {/* Vertical Title Removed as requested */}
            </motion.div>
          ))}
        </div>

        {/* Mobile & Tablet Grid (Scrollable) */}
        <div className="lg:hidden">
          <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory hide-scrollbar px-4">
            {artforms.map((art) => (
              <div 
                key={art.id} 
                className="flex-shrink-0 w-[280px] h-[400px] relative rounded-3xl overflow-hidden snap-start shadow-xl"
              >
                <img
                  src={art.imagePath}
                  alt={art.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${art.color} to-transparent opacity-70`} />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-2xl font-bold mb-2">{art.title}</h3>
                  <p className="text-sm text-blue-50 mb-4">{art.description}</p>
                  {/* Removed View All button */}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <p className="text-slate-400 text-sm flex items-center gap-2 italic">
              Scroll to explore more <ArrowRight className="w-4 h-4 animate-bounce-x" />
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
      `}</style>
    </section>
  );
});

ArtFormsCarousel.displayName = "ArtFormsCarousel";

export default ArtFormsCarousel;