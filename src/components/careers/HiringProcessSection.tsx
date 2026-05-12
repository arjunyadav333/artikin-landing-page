import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    title: "Application Review",
    desc: "Our team reviews your profile, portfolio, and experience.",
    time: "2-3 Days"
  },
  {
    title: "Screening Call",
    desc: "A quick 30-minute chat to discuss your background and Artikin's mission.",
    time: "Day 5"
  },
  {
    title: "Creative/Technical Assessment",
    desc: "A hands-on task designed to showcase your skills in a real-world scenario.",
    time: "Week 2"
  },
  {
    title: "Culture & Leadership Interview",
    desc: "Meet with our leads to discuss long-term alignment and growth.",
    time: "Week 3"
  }
];

const HiringProcessSection = () => {
  return (
    <section id="process" className="py-32 bg-slate-900 px-6 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-50" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-6 block">The Recruitment Journey</span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8">Our Hiring Process</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto mb-10" />
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            We value your time. Our process is designed to be transparent, fast, and thorough, ensuring the best fit for both you and Artikin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative p-10 bg-slate-800/50 border border-white/5 hover:border-primary/30 transition-all group"
            >
              <div className="absolute -top-6 left-10 w-12 h-12 bg-primary flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary/20">
                0{idx + 1}
              </div>
              
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                  {step.desc}
                </p>
                <div className="flex items-center gap-3 py-4 border-t border-white/5">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">{step.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HiringProcessSection;
