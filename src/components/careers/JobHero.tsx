import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Briefcase } from "lucide-react";

interface JobHeroProps {
  title: string;
  department: string;
  location: string;
  type: string;
}

const JobHero = ({ title, department, location, type }: JobHeroProps) => {
  return (
    <section className="pt-40 pb-20 bg-slate-50 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">{department}</span>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">{title}</h1>
          
          <div className="flex flex-wrap gap-8 text-slate-500 font-bold">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {location}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {type}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Artikin Official
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default JobHero;
