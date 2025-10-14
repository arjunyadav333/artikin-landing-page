import React, { memo } from "react";

const WhatIsArtikin = memo(() => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
         <h2 className="text-3xl md:text-5xl font-bold mb-8 text-blue-500 font-inter">
  What is Artikin?
</h2>

          <div className="max-w-4xl mx-auto">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed px-2">Artikin is a creative networking platform designed for artists to showcase their work, build meaningful connections, and discover opportunities with organizations. It acts as a bridge between creativity and industry helping artists gain visibility while enabling organizations to find the right talent.</p>
        </div>
        </div>
      </div>
    </section>
  );
});

WhatIsArtikin.displayName = 'WhatIsArtikin';

export default WhatIsArtikin;