import React from "react";
import { Rocket, Heart, Target } from "lucide-react";

const Mission = () => {
  return (
    <section id="mission" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Side: Visual */}
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/10">
              <img 
                src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800&h=1000" 
                alt="Art and Creativity" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
            </div>
            {/* Decorative background shapes */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-50 rounded-full -z-10" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-slate-50 rounded-[3rem] rotate-12 -z-10" />
          </div>

          {/* Right Side: Content */}
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-blue-500 mb-8 leading-[1.1]">
              Empowering the World's Creativity Through Connection
            </h2>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
              At Artikin, we believe that every artist deserves a global stage. Our mission is to bridge the gap between raw talent and professional opportunity, creating a digital ecosystem where creativity thrives without boundaries.
            </p>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Rocket size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Accelerate Careers</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">Providing the tools and visibility artists need to reach the next level faster.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                  <Heart size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Foster Community</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">Building a supportive space for collaboration, mentorship, and inspiration.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
