import { Button } from "@/components/ui/button";
import { ArrowUpRight, Sparkles } from "lucide-react";

const FinalCTA = () => {
  const handleGetStarted = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[#4F8FF0]">
      {/* --- Creative Background Elements --- */}
      {/* Dynamic Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-[100px]" />
      </div>

      {/* Subtle Grain/Noise Overlay for an "Artistic" texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Section Icon/Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-100" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-blue-50">
              The Next Step
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
            Ready to elevate your <br className="hidden md:block" /> 
            <span className="">creative journey?</span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-blue-50/80 font-light leading-relaxed">
            Join thousands of artists who are already building their careers on <span className="font-semibold text-white">Artikin.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              onClick={handleGetStarted}
              className="group relative h-16 px-12 text-lg font-bold rounded-full transition-all duration-500 bg-white text-[#4F8FF0] hover:bg-blue-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started 
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </Button>
          
          </div>
        </div>
      </div>

      {/* Bottom Border Accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </section>
  );
};

export default FinalCTA;