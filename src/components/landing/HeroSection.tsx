import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, X } from 'lucide-react';
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import React, { useState, useEffect } from "react";
const HeroSection = () => {
  const { navigateWithScrollSave } = useScrollRestoration();
  return (
    <>
      <section id="home" className="relative min-h-screen xs:min-h-[100dvh] flex items-start md:items-center justify-center overflow-hidden pt-20 xs:pt-24 sm:pt-32 md:pt-0">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            {/* Badge */}

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Connecting creativity
              <span className="text-3xl font-bold text-blue-500 mb-2">
                with Oppurtunity
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              From emerging creators to established talent, Artikin gives every artist a space to showcase their work and connect with the people.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group bg-blue-400 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-500 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center" onClick={() => navigateWithScrollSave("/auth")}>
                Join Artikin
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={() =>
                  window.open("https://youtu.be/lu58Um79-N4?si=g6JycaokuKJKDpcd", "Ayejude")
                }
                className="group flex items-center px-8 py-4 text-gray-700 font-semibold text-lg hover:text-blue-400 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mr-3 group-hover:shadow-xl transition-shadow duration-300">
                  <Play className="w-5 h-5 text-blue-400 ml-1" />
                </div>
                Watch Trailer
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { number: '1K+', label: 'Users' },
                { number: '99.9%', label: 'Uptime' },
                { number: '24/7', label: 'Support' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-3xl font-bold text-blue-500 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 xs:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

    </>
  );
};

export default HeroSection;
