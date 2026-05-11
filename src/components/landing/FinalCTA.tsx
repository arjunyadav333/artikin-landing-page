import { Button } from "@/components/ui/button";
import AppStoreButtons from './AppStoreButtons';

const FinalCTA = () => {
  const handleGetStarted = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="final-cta" className="py-16 sm:py-20 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl p-10 sm:p-16 text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden max-w-6xl mx-auto">
          {/* Decorative shapes inside the card */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-900/20 blur-3xl pointer-events-none" />

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white relative z-10">
            Ready to elevate your creative journey?
          </h2>
          
          <p className="text-lg md:text-xl text-blue-50 mb-12 max-w-2xl mx-auto relative z-10">
            Join thousands of artists who are already building their careers on Artikin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <AppStoreButtons dark={true} className="justify-center" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;