import React from "react";

const WhatIsArtikin = () => {
  return (
    <section className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center">
      
      {/* subtle vertical line */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-gray-100 -translate-x-1/2"></div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        
        {/* Label */}
        <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">
          About Platform
        </p>

        {/* Heading */}
        <h2 className="text-4xl md:text-6xl font-extrabold text-blue-500 leading-tight mb-8">
          What is{" "}
          <span className="text-blue-500 relative inline-block">
            Artikin
            {/* <span className="absolute left-0 bottom-1 w-full h-2 bg-blue-100 -z-10 rounded"></span> */}
          </span>
          ?
        </h2>

        {/* Main Text */}
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">
          Artikin is a{" "}
          <span className="text-gray-900 font-semibold">
            creative networking platform
          </span>{" "}
          designed for artists to showcase their work, build meaningful
          connections, and discover opportunities with organizations.
        </p>

        {/* Secondary Text */}
        <p className="text-base md:text-lg text-gray-500 leading-relaxed">
          It acts as a bridge between{" "}
          <span className="text-blue-600 font-medium">
            creativity
          </span>{" "}
          and{" "}
          <span className="text-blue-600 font-medium">
            industry
          </span>{" "}
          helping artists gain visibility while enabling organizations to find
          the right talent.
        </p>

        {/* Bottom Accent */}
        <div className="mt-10 flex justify-center">
          <div className="h-[3px] w-20 bg-blue-500 rounded-full"></div>
        </div>

      </div>
    </section>
  );
};

export default WhatIsArtikin;