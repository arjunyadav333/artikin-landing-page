import { Button } from "@/components/ui/button";
import { Palette, Briefcase, Users, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Portfolio Builder",
    description: "Create stunning portfolios with drag-and-drop media and customizable layouts to showcase your best work.",
    color: "from-pink-500 to-rose-400",
    bg: "bg-pink-50"
  },
  {
    icon: Briefcase,
    title: "Find Opportunities",
    description: "Discover casting calls, gigs, and projects that match your skills and artistic vision.",
    color: "from-blue-600 to-cyan-500",
    bg: "bg-blue-50"
  },
  {
    icon: Users,
    title: "Build Your Network",
    description: "Connect with like-minded artists, collaborators, and industry professionals to grow your career.",
    color: "from-violet-600 to-purple-500",
    bg: "bg-violet-50"
  },
];

const FeaturesAndCTASection = () => {
  const handleCreateProfile = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* --- CTA Section --- */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Artistic Background Accents */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px] opacity-60" />

        <div className="container relative mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
              Start building your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                creative portfolio
              </span> today
            </h2>

            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with industry professionals and showcase your talent to the world.
            </p>

            <Button
              onClick={handleCreateProfile}
              className="group relative h-16 px-10 text-lg font-bold rounded-full overflow-hidden transition-all duration-300 bg-slate-900 text-white hover:bg-slate-800 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Create Your Profile <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-24 bg-slate-50/50 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold text-blue-600 tracking-tight">
                Detailed Features
              </h2>
              <div className="h-1.5 w-24 bg-blue-600 mt-4 rounded-full" />
            </div>
            <p className="text-slate-500 font-medium">Tools built for the modern creator.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative"
              >
                {/* Decorative glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-500`} />
                
                <div className="relative h-full bg-white border border-slate-100 p-8 rounded-[2rem] transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                  
                  {/* Icon Wrapper */}
                  <a
                    href="https://preview--artikin-artist.lovable.app/auth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg mb-8 group-hover:rotate-6 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </a>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">
                      Learn More
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesAndCTASection;