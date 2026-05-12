import React from "react";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Do you offer remote work?",
    a: "Yes. Artikin is a remote-first company. While we have physical creative hubs in Bengaluru and Mumbai, most of our roles are open to global talent working from anywhere."
  },
  {
    q: "What is the hiring process like?",
    a: "Our process is fast and transparent: Application review, Initial screening, Technical/Creative assessment, and a Culture-fit interview. We aim for a 2-3 week turnaround."
  },
  {
    q: "Are there growth opportunities?",
    a: "Every hire at Artikin is a future leader. We provide a significant learning budget and internal mentorship to help you master your craft and scale your career."
  },
  {
    q: "What benefits do you offer?",
    a: "Comprehensive health insurance, mental wellness support, high-end equipment budgets, and annual team retreats are standard for all full-time members."
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="py-40 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32">
          {/* Left: Section Header */}
          <div className="lg:col-span-4">
            <div className="sticky top-40">
              <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-8 block">Common Queries</span>
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-blue-500 mb-10 leading-tight">Everything <br /> You Need <br /> to Know.</h2>
              <div className="h-2 w-20 bg-primary" />
            </div>
          </div>

          {/* Right: Static FAQ List */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                      0{idx + 1}
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">{faq.q}</h3>
                </div>
                <p className="text-lg text-slate-500 leading-relaxed font-medium pl-12 border-l border-slate-100 group-hover:border-primary/20 transition-colors">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
