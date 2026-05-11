import React from "react";

const WhatIsArtikin = () => {
  return (
    <section id="about" className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-blue-500">
            What is Artikin?
          </h2>
          <div className="w-24 h-1 bg-blue-500/20 mb-10 rounded-full" />
          
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 leading-relaxed font-light">
            Artikin is a creative networking platform designed for artists to showcase their work, build meaningful connections, and discover opportunities with organizations. It acts as a bridge between creativity and industry, helping artists gain visibility while enabling organizations to find the right talent.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhatIsArtikin;