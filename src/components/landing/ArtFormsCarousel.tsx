import React, { useState, useEffect, useRef, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Lazy load images - only import when needed
const artforms = [
  { title: "Acting", description: "An actor brings stories to life by expressing emotions, characters, and experiences on stage or screen.", imagePath: "/src/assets/acting-slide.jpg" },
  { title: "Dancer", description: "A dancer expresses stories and emotions through graceful movements and rhythm.", imagePath: "/src/assets/dance-slide.jpg" },
  { title: "Model", description: "They express creativity through presence and pose.", imagePath: "/src/assets/modeling-slide.jpg" },
  { title: "Photographer", description: "A photographer captures stories, emotions, and beauty through their lens.", imagePath: "/src/assets/photography-slide.jpg" },
  { title: "Videographer", description: "They create visuals that bring ideas, events, and memories to life.", imagePath: "/src/assets/videography-slide.jpg" },
  { title: "Instrumentalist", description: "A skilled musician expressing deep emotion through a musical instrument.", imagePath: "/src/assets/instrumentalist-slide.jpg" },
  { title: "Singer", description: "The voice is their instrument, emotion their song.", imagePath: "/src/assets/singer-slide.jpg" },
  { title: "Drawing", description: "Using simple tools to bring complex imaginations to life.", imagePath: "/src/assets/drawing-slide.jpg" },
  { title: "Painting", description: "Bringing a canvas to life with color, light, and emotion.", imagePath: "/src/assets/painting-slide.jpg" },
];

// Optimized image component with lazy loading and blur placeholder
const LazyImage = memo(({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Dynamically import image when it's visible
            import(`@/assets/${src.split('/').pop()}`).then((module) => {
              setImageSrc(module.default);
            }).catch(() => {
              // Fallback to direct path if import fails
              setImageSrc(src);
            });
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
  }, [src]);

  return (
    <div ref={imgRef} className="relative bg-gray-200 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
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