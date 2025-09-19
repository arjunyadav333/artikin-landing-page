import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, Palette, Zap, Star, CheckCircle, Target } from 'lucide-react';
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import Footer from "@/components/layout/footer";

const Index = () => {
  const { navigateWithScrollSave } = useScrollRestoration();

  const features = [
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Creative Portfolio",
      description: "Showcase your work with beautiful galleries and professional presentation tools."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Connect & Collaborate",
      description: "Build meaningful connections with artists, organizations, and creative professionals."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Find Opportunities",
      description: "Discover projects, commissions, and career opportunities tailored to your skills."
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Artists' },
    { number: '500+', label: 'Organizations' },
    { number: '1M+', label: 'Connections Made' },
    { number: '99.9%', label: 'Uptime' }
  ];

  const testimonials = [
    {
      quote: "Artikin transformed my career as an artist. I've connected with amazing opportunities I never would have found otherwise.",
      author: "Sarah Chen",
      role: "Digital Artist"
    },
    {
      quote: "The platform makes it so easy to discover talented artists for our projects. It's become our go-to resource.",
      author: "Marcus Rodriguez",
      role: "Creative Director"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Connecting creativity
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-text">
                with opportunity
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              From emerging creators to established talent, Artikin gives every artist a space to showcase their work and connect with opportunities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                onClick={() => navigateWithScrollSave("/auth")}
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="group px-8 py-4 text-lg font-semibold border-primary/20 hover:bg-primary/10 hover:border-primary/50"
                onClick={() => navigateWithScrollSave("/auth")}
              >
                Join Artikin
                <Users className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-muted-foreground/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for creative professionals and organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Loved by creators worldwide
            </h2>
            <div className="flex justify-center items-center gap-2 mb-8">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-lg text-muted-foreground ml-2">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-card rounded-2xl p-8 shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${index * 300}ms` }}
              >
                <p className="text-card-foreground text-lg leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-card-foreground">{testimonial.author}</div>
                    <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to start your creative journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of artists and organizations already using Artikin to build meaningful connections and find amazing opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                onClick={() => navigateWithScrollSave("/auth")}
              >
                Get Started Free
                <CheckCircle className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                onClick={() => navigateWithScrollSave("/auth")}
              >
                Join Artikin
                <Zap className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
