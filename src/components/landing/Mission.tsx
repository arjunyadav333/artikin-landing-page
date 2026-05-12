import React from "react";
import { Rocket, Heart, ArrowUpRight } from "lucide-react";

import paintingImg from "@/assets/mission-painting.png";
import digitalArtImg from "@/assets/mission-digital-art.png";
import photographyImg from "@/assets/mission-photography.png";
import danceImg from "@/assets/mission-dance.png";
import sculptureImg from "@/assets/mission-sculpture.png";

const Mission = () => {
  return (
    <section id="mission" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left Side: Structured Bento Grid */}
          <div className="lg:w-1/2 w-full">
            <div className="grid grid-cols-12 grid-rows-6 gap-3 sm:gap-4 h-[500px] sm:h-[650px]">
              {/* Painting - Main Feature */}
              <div className="col-span-8 row-span-4 rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 group relative">
                <img src={paintingImg} alt="Fine Arts" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-6 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="font-bold text-lg">Fine Arts</p>
                </div>
              </div>

              {/* Digital Art - Top Right */}
              <div className="col-span-4 row-span-2 rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200 group relative">
                <img src={digitalArtImg} alt="Digital" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
              </div>

              {/* Sculpture - Middle Right */}
              <div className="col-span-4 row-span-2 rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200 group relative">
                <img src={sculptureImg} alt="3D Art" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
              </div>

              {/* Photography - Bottom Left */}
              <div className="col-span-5 row-span-2 rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200 group relative">
                <img src={photographyImg} alt="Photography" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
              </div>

              {/* Dance - Bottom Right */}
              <div className="col-span-7 row-span-2 rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200 group relative">
                <img src={danceImg} alt="Performing Arts" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
              </div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-blue-500 mb-8 leading-[1.1]">
              Empowering the World's Creativity Through Connection
            </h2>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium">
              At Artikin, we believe that every artist deserves a global stage. Our mission is to bridge the gap between raw talent and professional opportunity, creating a digital ecosystem where creativity thrives without boundaries.
            </p>

            <div className="grid sm:grid-cols-2 gap-10">
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                  <Rocket size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Accelerate Careers</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Providing the high-end tools and visibility professional artists need to reach their peak potential.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
                  <Heart size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Foster Community</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Building a secure, professional space for meaningful collaboration and industry-leading mentorship.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-100 flex items-center gap-4 text-slate-400 text-sm font-medium">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                  </div>
                ))}
              </div>
              <p>Join 10,000+ artists already growing with Artikin</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
