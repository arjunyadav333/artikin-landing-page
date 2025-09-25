import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const BlueHighlightSection = () => {
  const navigate = useNavigate();
  
  const words = [
    "Actors", "Dancers", "Models", "Photographers", 
    "Videographers", "Instrumentalists", "Singers", "Painters", "Creators"
  ];
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const speed = isDeleting ? 100 : 150;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
        
        if (displayText === currentWord) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentWord.slice(0, displayText.length - 1));
        
        if (displayText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex, words]);

  return (
    <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 font-inter">
            Showcase your art, Connect with{" "}
            <span className="inline-block min-w-[200px] text-left">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
          </h2>
          
          <Button 
            onClick={() => navigate("/auth")} 
            className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-inter"
          >
            Start Building Your Portfolio
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlueHighlightSection;