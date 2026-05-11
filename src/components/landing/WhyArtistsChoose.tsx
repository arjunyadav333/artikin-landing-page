import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Briefcase, Users } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Portfolio Builder",
    description:
      "Create stunning portfolios with drag-and-drop media and customizable layouts to showcase your best work.",
  },
  {
    icon: Briefcase,
    title: "Find Opportunities",
    description:
      "Discover casting calls, gigs, and projects that match your skills and artistic vision.",
  },
  {
    icon: Users,
    title: "Build Your Network",
    description:
      "Connect with like-minded artists, collaborators, and industry professionals to grow your career.",
  },
];

const FeaturesAndCTASection = () => {
  const handleCreateProfile = () => {
    const element = document.querySelector("#final-cta");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Features Section */}
      <section className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 border-[48px] border-blue-500/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 border-[48px] border-blue-500/5 rounded-full pointer-events-none opacity-50" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center text-blue-500">
              Powerful Tools for Artists
            </h2>
            <div className="w-24 h-1 bg-blue-500/20 mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto auto-rows-[240px]">
            {/* Featured Item: Portfolio Builder */}
            <div className="md:col-span-2 md:row-span-2 bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden relative">
              <div className="relative z-20 max-w-sm">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Palette className="w-8 h-8" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Portfolio Builder</h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Create stunning portfolios with drag-and-drop media and customizable layouts to showcase your best work.
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span>Try it now</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Floating UI Mockup */}
              <div className="absolute right-0 bottom-0 w-full md:w-3/5 h-full pointer-events-none transition-transform duration-700 group-hover:scale-105 group-hover:rotate-1 origin-bottom-right">
                <div className="absolute right-10 bottom-10 w-[400px] aspect-video bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform rotate-[-4deg] translate-y-4">
                  <div className="h-6 bg-slate-100 flex items-center px-3 gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-2">
                    <div className="aspect-square bg-blue-50 rounded-lg animate-pulse" />
                    <div className="aspect-square bg-slate-50 rounded-lg" />
                    <div className="aspect-square bg-slate-50 rounded-lg" />
                    <div className="col-span-2 h-4 bg-slate-100 rounded-md" />
                    <div className="h-4 bg-blue-100 rounded-md" />
                  </div>
                </div>
                <div className="absolute right-[-20px] bottom-20 w-[240px] aspect-square bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform rotate-[6deg] translate-y-12">
                  <img 
                    src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400" 
                    className="w-full h-full object-cover"
                    alt="Portfolio Preview"
                  />
                </div>
              </div>

              {/* Decorative gradients */}
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-gradient-to-br from-blue-500/0 to-blue-500/10 rounded-tl-full blur-3xl pointer-events-none" />
            </div>

            {/* Item 2: Find Opportunities */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col group hover:shadow-blue-500/10 transition-all duration-500">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Find Opportunities</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Discover casting calls, gigs, and projects that match your skills and artistic vision.
              </p>
            </div>

            {/* Item 3: Build Your Network */}
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 flex flex-col group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Build Your Network</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Connect with like-minded artists and industry professionals to grow your career.
                </p>
              </div>
              {/* Subtle background texture */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-slate-900">
              Start building your creative portfolio today
            </h2>

            <p className="text-lg sm:text-xl text-slate-600 mb-12 leading-relaxed">
              Connect with industry professionals and showcase your talent to the world.
            </p>

            <Button
              variant="default"
              size="lg"
              onClick={handleCreateProfile}
              className="h-14 px-10 text-lg font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              Create Your Profile
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesAndCTASection;
