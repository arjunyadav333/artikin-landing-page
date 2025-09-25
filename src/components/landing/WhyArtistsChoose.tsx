import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Briefcase, Users, Heart } from "lucide-react";

const WhyArtistsChoose = () => {
  const features = [
    {
      icon: Palette,
      title: "Portfolio Builder",
      description: "Create a professional showcase for your work with our intuitive portfolio builder and customizable layouts."
    },
    {
      icon: Briefcase,
      title: "Find Opportunities",
      description: "Access jobs, gigs, and collaborations that match your skills and artistic vision from organizations worldwide."
    },
    {
      icon: Users,
      title: "Build Your Network",
      description: "Connect with other creatives and organizations to grow your career and expand your artistic horizons."
    },
    {
      icon: Heart,
      title: "Community Support",
      description: "A safe space to learn, grow, and share with like-minded artists in a supportive creative community."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gray-900 font-inter">
          Why Artists Choose Artikin?
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 font-inter">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed font-inter">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyArtistsChoose;