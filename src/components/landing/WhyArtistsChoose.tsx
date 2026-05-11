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
      <section className="py-16 sm:py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center text-blue-500">
              Detailed Features
            </h2>
            <div className="w-24 h-1 bg-blue-500/20 mt-6 rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center transition-all duration-300 hover:-translate-y-2 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-blue-500/10 bg-white p-8 sm:p-10 rounded-3xl"
              >
                <CardHeader className="pb-6">
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:bg-blue-500 hover:text-white shadow-inner">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-slate-600 leading-relaxed text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
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
