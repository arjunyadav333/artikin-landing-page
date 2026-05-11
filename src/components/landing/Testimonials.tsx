import React from "react";
import { Quote } from "lucide-react";

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
  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Column: Content */}
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

          {/* Right Column: Testimonial Feed */}
          <div className="lg:w-1/2 w-full">
            <div className="space-y-6 relative">
              {/* Decorative background blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100 blur-[100px] rounded-full opacity-50 -z-10" />
              
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-blue-200 transition-all duration-300 transform ${
                    index === 1 ? 'lg:translate-x-8' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-50"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className="text-xs">★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 font-bold mb-3 uppercase tracking-wider">{testimonial.role}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        "{testimonial.content}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
