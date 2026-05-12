import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const Culture = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -1000]);

  const slides = [
    {
      title: "Creativity First",
      desc: "We believe that creativity is the ultimate problem-solving tool. Our team is encouraged to think like artists.",
      tag: "01"
    },
    {
      title: "Build Fast, Iterate Faster",
      desc: "We prioritize velocity and learning. We launch early, get feedback, and refine constantly.",
      tag: "02"
    },
    {
      title: "Radical Transparency",
      desc: "Information is shared openly across the company. We trust our team with the big picture.",
      tag: "03"
    },
    {
      title: "Long-term Thinking",
      desc: "We're not building for the next quarter; we're building for the next decade of the creative industry.",
      tag: "04"
    }
  ];

  return (
    <section ref={containerRef} className="py-24 bg-[#0F172A] overflow-hidden">
      <div className="px-6 mb-16 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Culture</h2>
        <p className="text-white/60">The principles that guide how we work and build together.</p>
      </div>

      <motion.div 
        style={{ x }}
        className="flex gap-12 px-6 ml-[10%] md:ml-[20%]"
      >
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className="flex-shrink-0 w-[80vw] md:w-[400px] h-[500px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-[40px] p-12 flex flex-col justify-between"
          >
            <span className="text-6xl font-black text-white/5">{slide.tag}</span>
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">{slide.title}</h3>
              <p className="text-white/60 text-lg leading-relaxed">{slide.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default Culture;
