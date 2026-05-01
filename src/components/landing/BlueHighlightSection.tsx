import React, { useState, useEffect } from "react";

const HumanoidSection = () => {
  const words = [
    "Showcase your art, Connect with opportunities, Grow with Artikin.",
    "Empowering artists with portfolios, connections, and real opportunities.",
    "A creative hub for artists to shine and organizations to discover talent.",
  ];

  const [currentWord, setCurrentWord] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const current = words[currentWord];
    let speed = 120; // typing speed

    if (pause) speed = 1000; // pause speed

    const handleTyping = setTimeout(() => {
      if (!pause) {
        // typing forward
        setDisplayedText(current.slice(0, displayedText.length + 1));

        if (displayedText === current) {
          // when fully typed
          setPause(true);
          setTimeout(() => {
            setPause(false);
            // go to next word
            setCurrentWord((prev) => (prev + 1) % words.length);
            setDisplayedText(""); // reset for next word
          }, 2000); // stay visible for 2s
        }
      }
    }, speed);

    return () => clearTimeout(handleTyping);
  }, [displayedText, pause, words, currentWord]);

  return (
    <section
      className="w-full h-screen py-0 md:py-0 overflow-hidden bg-white"
      id="why-humanoid"
    >
      <div className="container px-6 lg:px-8 mx-auto h-full flex flex-col">
        <div className="flex flex-col items-center">
          <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-1 md:mb-2 text-blue-500">
            Why Artikin?
          </h2>
          <div className="flex items-center gap-4 pt-8 sm:pt-6 md:pt-4">
            <div
              className="pulse-chip opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">
                
              </span>
              <span>Artikin</span>
            </div>
          </div>
        </div>
        <div className="relative flex-1" style={{ minHeight: 340 }}>
          <div
            className="absolute inset-0 rounded-3xl shadow-xl flex flex-col justify-center items-start px-14 py-12"
            style={{
              background: "linear-gradient(90deg, #1d194aff 0%, #0073cf 100%)",
            }}
          >
            <div className="absolute top-6 right-6 z-20">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium">
                The vision
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-display text-white font-bold leading-tight mb-4">
                {displayedText}
                <span className="animate-blink ml-1">|</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HumanoidSection;
