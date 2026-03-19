import React, { useState, useEffect, useRef, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import actingSlide from "@/assets/acting-slide.jpg";
import danceSlide from "@/assets/dance-slide.jpg";
import modelingSlide from "@/assets/modeling-slide.jpg";
import photographySlide from "@/assets/photography-slide.jpg";
import videographySlide from "@/assets/videography-slide.jpg";
import instrumentalistSlide from "@/assets/instrumentalist-slide.jpg";
import singerSlide from "@/assets/singer-slide.jpg";
import drawingSlide from "@/assets/drawing-slide.jpg";
import paintingSlide from "@/assets/painting-slide.jpg";

const artforms = [
  { title: "Acting", description: "An actor brings stories to life by expressing emotions, characters, and experiences on stage or screen.", imagePath: actingSlide },
  { title: "Dancer", description: "A dancer expresses stories and emotions through graceful movements and rhythm.", imagePath: danceSlide },
  { title: "Model", description: "They express creativity through presence and pose.", imagePath: modelingSlide },
  { title: "Photographer", description: "A photographer captures stories, emotions, and beauty through their lens.", imagePath: photographySlide },
  { title: "Videographer", description: "They create visuals that bring ideas, events, and memories to life.", imagePath: videographySlide },
  { title: "Instrumentalist", description: "A skilled musician expressing deep emotion through a musical instrument.", imagePath: instrumentalistSlide },
  { title: "Singer", description: "The voice is their instrument, emotion their song.", imagePath: singerSlide },
  { title: "Drawing", description: "Using simple tools to bring complex imaginations to life.", imagePath: drawingSlide },
  { title: "Painting", description: "Bringing a canvas to life with color, light, and emotion.", imagePath: paintingSlide },
];

// Optimized image component with lazy loading
const LazyImage = memo(({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative bg-gray-200 overflow-hidden h-56">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

const ArtFormsCarousel = memo(() => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 text-blue-500">
          Explore Art Forms
        </h2>
        <Swiper 
          modules={[Navigation, Pagination, Autoplay]} 
          slidesPerView={1} 
          spaceBetween={20} 
          navigation 
          pagination={{ clickable: true }} 
          autoplay={{ delay: 3000, disableOnInteraction: false }} 
          breakpoints={{640:{slidesPerView:2},1024:{slidesPerView:3}}}
        >
          {artforms.map((art, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <LazyImage 
                  src={art.imagePath} 
                  alt={art.title} 
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{art.title}</h3>
                  <p className="text-gray-600">{art.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
});

ArtFormsCarousel.displayName = "ArtFormsCarousel";

export default ArtFormsCarousel;