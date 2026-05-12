import React from "react";
import { motion } from "framer-motion";
import { Rocket, Zap, Heart, Globe, Users, Star } from "lucide-react";

const WhyArtikin = () => {
  const cards = [
    {
      title: "Real Impact",
      desc: "Every line of code and every design pixel directly empowers artists worldwide.",
      icon: <Zap className="w-6 h-6 text-primary" />,
      size: "col-span-1 md:col-span-2",
      color: "from-primary/5 to-transparent"
    },
    {
      title: "Fast Growth",
      desc: "We move fast and build for scale. Your growth is our priority.",
      icon: <Rocket className="w-6 h-6 text-[#4F46E5]" />,
      size: "col-span-1",
      color: "from-[#4F46E5]/5 to-transparent"
    },
    {
      title: "Creative Freedom",
      desc: "Experiment, fail, and innovate. We value creative solutions over hierarchy.",
      icon: <Heart className="w-6 h-6 text-[#EC4899]" />,
      size: "col-span-1",
      color: "from-[#EC4899]/5 to-transparent"
    },
    {
      title: "Build for Millions",
      desc: "Our platform reaches a global audience of creators and organizations.",
      icon: <Globe className="w-6 h-6 text-[#10B981]" />,
      size: "col-span-1 md:col-span-2",
      color: "from-[#10B981]/5 to-transparent"
    }
  ];

  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">Why Join Artikin?</h2>
          <p className="text-[#0F172A]/60 max-w-xl mx-auto">We are more than just a startup. We are a movement dedicated to the creative economy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className={`relative group overflow-hidden rounded-3xl p-8 border border-[#0F172A]/5 bg-gradient-to-br ${card.color} ${card.size}`}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{card.title}</h3>
                <p className="text-[#0F172A]/60 leading-relaxed">{card.desc}</p>
              </div>
              
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyArtikin;
