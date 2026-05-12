import React from "react";
import { Shield, Rocket, Heart, Zap, Globe, Star } from "lucide-react";

const benefits = [
  {
    title: "Remote First",
    desc: "Work from anywhere in the world. We believe in results, not clocking in from a specific chair.",
    icon: Globe
  },
  {
    title: "Ownership Culture",
    desc: "Every team member is a part-owner. We offer competitive equity and a voice in our direction.",
    icon: Rocket
  },
  {
    title: "Premium Benefits",
    desc: "Top-tier health insurance, mental wellness programs, and a generous equipment budget.",
    icon: Shield
  },
  {
    title: "Global Impact",
    desc: "Build tools that help millions of artists showcase their talent and find life-changing work.",
    icon: Star
  },
  {
    title: "Learning Budget",
    desc: "Continuous growth is key. We provide an annual budget for courses, books, and conferences.",
    icon: Zap
  },
  {
    title: "Team Retreats",
    desc: "Twice a year, we bring the whole global team together for work, play, and connection.",
    icon: Heart
  }
];

const BenefitsGrid = () => {
  return (
    <section id="benefits" className="py-32 bg-[#F8FAFB] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Benefits</span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-blue-500 mb-0">Designed for <br /> Human Potential.</h2>
          </div>
          <p className="text-xl text-slate-500 max-w-md font-medium leading-relaxed">
            We've built Artikin to be a place where the best people in the world can do the best work of their lives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 shadow-2xl">
          {benefits.map((benefit, idx) => (
            <div 
              key={idx} 
              className="group p-12 bg-white hover:bg-slate-50 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary transition-all duration-500">
                <benefit.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">{benefit.title}</h3>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsGrid;
