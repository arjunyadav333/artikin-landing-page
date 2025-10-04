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
import instrumentalistSlide from "@/assets/instrumentalist-slide.jpg";
import singerSlide from "@/assets/singer-slide.jpg";
import drawingSlide from "@/assets/drawing-slide.jpg";
import paintingSlide from "@/assets/painting-slide.jpg";

const ArtFormsCarousel = () => {
  const artforms = [
    { title: "Acting", description: "An actor brings stories to life by expressing emotions, characters, and experiences on stage or screen.", image: actingSlide },
    { title: "Dancer", description: "A dancer expresses stories and emotions through graceful movements and rhythm.", image: danceSlide },
    { title: "Model", description: "They express creativity through presence and pose.", image: modelingSlide },
    { title: "Photographer", description: "A photographer captures stories, emotions, and beauty through their lens.", image: photographySlide },
    { title: "Videographer", description: "They create visuals that bring ideas, events, and memories to life.", image: videographySlide },
    { title: "Instrumentalist", description: "A skilled musician expressing deep emotion through a musical instrument.", image: instrumentalistSlide },
    { title: "Singer", description: "The voice is their instrument, emotion their song.", image: singerSlide },
    { title: "Drawing", description: "Using simple tools to bring complex imaginations to life.", image: drawingSlide },
    { title: "Painting", description: "Bringing a canvas to life with color, light, and emotion.", image: paintingSlide },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 text-3xl font-bold text-blue-500 mb-2 ">Explore Art Forms</h2>
          <Swiper modules={[Navigation, Pagination, Autoplay]} slidesPerView={1} spaceBetween={20} navigation pagination={{ clickable: true }} autoplay={{ delay: 3000 }} breakpoints={{640:{slidesPerView:2},1024:{slidesPerView:3}}}>
            {artforms.map((art, index)=>(
              <SwiperSlide key={index}>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <img src={art.image} alt={art.title} className="w-full h-56 object-cover"/>
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
};

export default ArtFormsCarousel;