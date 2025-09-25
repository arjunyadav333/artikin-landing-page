import { Button } from "@/components/ui/button";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
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
  const { navigateWithScrollSave } = useScrollRestoration();

  return (
    <>
      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 font-bold text-black-500 mb-2">
            Start building your creative portfolio today
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
            Connect with industry professionals and showcase your talent to the world.
          </p>

<Button
  variant="cta"
  size="lg"
  onClick={() => navigateWithScrollSave("/auth")}
  className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold rounded-xl touch-manipulation font-bold bg-blue-500 text-white hover:bg-blue-600 mb-2"
>
  Create Your Profile
</Button>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 font-bold text-blue-500 mb-2">
            Detailed Features
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-soft transition-all duration-200 hover:scale-[1.02] border-0 shadow-soft bg-background/80 backdrop-blur-sm p-6 sm:p-8"
              >
                <CardHeader className="pb-4">
                  <a
                    href="https://preview--artikin-artist.lovable.app/auth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </a>
                  <CardTitle className="text-lg sm:text-xl font-bold leading-tight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesAndCTASection;
