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
              <span className="block font-bold text-blue-500 mb-2">
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
  id="watch-trailer-btn"
  class="group flex items-center px-8 py-4 text-gray-700 font-semibold text-lg hover:text-blue-400 transition-colors duration-300"
>
  <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mr-3 group-hover:shadow-xl transition-shadow duration-300">
    <svg class="w-5 h-5 text-blue-400 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
  </div>
  Watch Trailer
</button>

<div id="video-modal" class="modal-overlay">
  <div class="modal-content">
    <button id="close-btn" class="close-button">&times;</button>
    <div class="video-container">
      <iframe 
        id="youtube-video"
        width="560" 
        height="315" 
        src="" 
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    /* Hidden by default */
    display: none; 
    
    /* Pop-up styling */
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.8);
    
    /* For centering the video */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    position: relative;
    width: 90%;
    max-width: 800px;
  }

  .close-button {
    position: absolute;
    top: -20px;
    right: -10px;
    color: #fff;
    font-size: 35px;
    font-weight: bold;
    background: none;
    border: none;
    cursor: pointer;
  }
  
  .video-container {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    height: 0;
    overflow: hidden;
  }

  .video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>

<script>
  // Get the elements
  const modal = document.getElementById("video-modal");
  const openBtn = document.getElementById("watch-trailer-btn");
  const closeBtn = document.getElementById("close-btn");
  const video = document.getElementById("youtube-video");

  // The YouTube video URL
  const videoURL = "https://www.youtube.com/embed/lu58Um79-N4";

  // When the user clicks the button, open the modal 
  openBtn.onclick = function() {
    modal.style.display = "flex";
    video.src = videoURL + "?autoplay=1"; // Add autoplay
  }

  // When the user clicks on <span> (x), close the modal
  closeBtn.onclick = function() {
    modal.style.display = "none";
    video.src = ""; // Stop the video
  }

  // When the user clicks anywhere outside of the modal content, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
      video.src = ""; // Stop the video
    }
  }
</script>
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
