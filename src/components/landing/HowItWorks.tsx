import React from "react";
import { UserPlus, Compass, Briefcase } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and build a stunning portfolio that highlights your best work, skills, and artistic vision.",
  },
  {
    icon: Compass,
    title: "Discover & Connect",
    description: "Explore opportunities, meet fellow artists, and collaborate with creators who share your passion.",
  },
  {
    icon: Briefcase,
    title: "Get Hired",
    description: "Apply for gigs, casting calls, and projects from organizations looking for your exact talent.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 bg-white text-slate-900 border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-blue-500">
            How Artikin Works
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Your journey to creative success in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative max-w-6xl mx-auto">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-8 relative z-10 group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-blue-500/10">
                <step.icon className="w-10 h-10 text-blue-500 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed px-4">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
