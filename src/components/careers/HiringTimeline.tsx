import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const steps = [
  { title: "Review", desc: "Profile & portfolio assessment.", time: "2-3 Days" },
  { title: "Screening", desc: "Intro chat to align vision.", time: "Day 5" },
  { title: "Assessment", desc: "Technical or creative task.", time: "Week 2" },
  { title: "Interview", desc: "Culture & leadership round.", time: "Week 3" },
  { title: "Offer", desc: "Final discussion & onboarding.", time: "Week 4" }
];

const HiringTimeline = () => {
  return (
    <div className="">
      <h3 className="text-xl font-bold text-slate-900 mb-10 uppercase tracking-widest">Hiring Process</h3>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-[7px] top-0 bottom-0 w-[1px] bg-slate-200" />
        
        <div className="space-y-12">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-10"
            >
              {/* Dot */}
              <div className="absolute left-0 top-1.5 w-4 h-4 bg-white border border-slate-300 rounded-none z-10 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-primary" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{step.title}</h4>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{step.time}</span>
                </div>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HiringTimeline;
