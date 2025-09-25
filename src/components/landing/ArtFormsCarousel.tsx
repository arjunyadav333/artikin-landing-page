import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import art form images
import actingSlide from "@/assets/acting-slide.jpg";
import danceSlide from "@/assets/dance-slide.jpg";
import modelingSlide from "@/assets/modeling-slide.jpg";
import photographySlide from "@/assets/photography-slide.jpg";
import videographySlide from "@/assets/videography-slide.jpg";
import singingSlide from "@/assets/singing-slide.jpg";
import voiceSlide from "@/assets/voice-slide.jpg";

const ArtFormsCarousel = () => {
  const artforms = [
    {
      title: "Actor",
      description: "Showcase your performances to casting directors and live audition calls. Build your acting portfolio with headshots, demo reels, and performance highlights.",
      image: actingSlide
    },
    {
      title: "Dancer",
      description: "Share choreography reels and join collaborative projects. Connect with other dancers, choreographers, and dance companies worldwide.",
      image: danceSlide
    },
    {
      title: "Model",
      description: "Build a portfolio of your best shoots and connect with agencies. Display your versatility across fashion, commercial, and artistic photography.",
      image: modelingSlide
    },
    {
      title: "Photographer",
      description: "Display your gallery, find commissioned gigs, and network with other creatives. Share your unique perspective and artistic vision.",
      image: photographySlide
    },
    {
      title: "Videographer",
      description: "Through the lens, emotions come alive. Stories aren't told, they're filmed. Share your cinematic vision and connect with filmmakers.",
      image: videographySlide
    },
    {
      title: "Instrumentalist",
      description: "Share your musical talent with the world. Connect with bands, orchestras, and music producers looking for skilled musicians.",
      image: singingSlide // Using singing slide as placeholder
    },
    {
      title: "Singer",
      description: "Upload samples, get feedback, and land studio sessions. Showcase your vocal range and connect with music industry professionals.",
      image: singingSlide
    },
    {
      title: "Painter",
      description: "Display your artistic creations and connect with galleries, collectors, and art enthusiasts who appreciate your unique style.",
      image: photographySlide // Using as placeholder for painting
    },
    {
      title: "Voice Artist",
      description: "Share your demos and audition for voice-over roles. Connect with studios, advertisers, and content creators needing voice talent.",
      image: voiceSlide
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gray-900 font-inter">
          Explore Art Forms
        </h2>
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={1}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ 
            delay: 4000,
            disableOnInteraction: false 
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 24
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 32
            }
          }}
          className="pb-16"
        >
          {artforms.map((art, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={art.image} 
                    alt={art.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 font-inter">{art.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-inter">{art.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ArtFormsCarousel;