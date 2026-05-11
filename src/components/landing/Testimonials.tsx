import React, { useState, useEffect, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Alex Rivers",
    role: "Digital Artist",
    content: "Artikin transformed how I showcase my portfolio. I've connected with more industry professionals in two months than I did in two years on other platforms.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "Sarah Chen",
    role: "Creative Director",
    content: "Finding the right talent used to be a chore. With Artikin, we can easily discover artists who fit our vision perfectly. The quality of work here is unmatched.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "Marcus Thorne",
    role: "Photographer",
    content: "The networking opportunities are incredible. I've collaborated on three major projects through Artikin. It's truly a game-changer for independent creators.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200"
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0); // 1 for right, -1 for left

  const nextTestimonial = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextTestimonial]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <section className="pt-24 pb-12 bg-white border-t border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Column: Content (Unchanged as requested) */}
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-blue-500 mb-6">
              A Community <br /> Built for Success
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
              Join thousands of artists and creators who have found their professional home on Artikin. Don't just take our word for it—hear it from the community.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                    className="w-12 h-12 rounded-full border-4 border-white shadow-sm"
                    alt="User avatar"
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-900">
                <span className="text-blue-500">5,000+</span> Artists joined this month
              </p>
            </div>
          </div>

          {/* Right Column: Testimonial Step Carousel */}
          <div className="lg:w-1/2 w-full">
            <div 
              className="relative min-h-[320px] flex flex-col items-center justify-center"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Decorative background blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100 blur-[100px] rounded-full opacity-50 -z-0" />
              
              <div className="relative w-full overflow-visible flex items-center justify-center px-4">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="w-full max-w-md bg-white p-8 rounded-[2rem] border border-slate-100 shadow-2xl shadow-blue-900/5 relative z-10"
                  >
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Quote className="text-white w-6 h-6" />
                    </div>

                    <div className="flex items-start gap-5 mb-6">
                      <img 
                        src={testimonials[currentIndex].image} 
                        alt={testimonials[currentIndex].name} 
                        className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-50"
                      />
                      <div>
                        <h4 className="font-bold text-xl text-slate-900 mb-1">{testimonials[currentIndex].name}</h4>
                        <p className="text-sm text-blue-600 font-bold uppercase tracking-widest">{testimonials[currentIndex].role}</p>
                        <div className="flex text-amber-400 mt-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className="text-sm">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-lg leading-relaxed italic font-medium">
                      "{testimonials[currentIndex].content}"
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows (Optional but helpful) */}
                <button 
                  onClick={prevTestimonial}
                  className="absolute left-[-20px] lg:left-[-40px] z-20 p-3 rounded-full bg-white shadow-lg text-slate-400 hover:text-blue-500 hover:scale-110 transition-all border border-slate-50"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextTestimonial}
                  className="absolute right-[-20px] lg:right-[-40px] z-20 p-3 rounded-full bg-white shadow-lg text-slate-400 hover:text-blue-500 hover:scale-110 transition-all border border-slate-50"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-3 mt-12 relative z-20">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`h-2 transition-all duration-500 rounded-full ${
                      index === currentIndex 
                        ? 'w-8 bg-blue-500' 
                        : 'w-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
