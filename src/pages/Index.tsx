import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Play, Palette, Briefcase, Users, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Assets for ArtformSlider
import actingSlide from "@/assets/acting-slide.jpg";
import modelingSlide from "@/assets/modeling-slide.jpg";
import singingSlide from "@/assets/singing-slide.jpg";
import danceSlide from "@/assets/dance-slide.jpg";
import photographySlide from "@/assets/photography-slide.jpg";
import videographySlide from "@/assets/videography-slide.jpg";
import voiceSlide from "@/assets/voice-slide.jpg";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { navigateWithScrollSave } = useScrollRestoration();

  // Hero typing animation
  const words = [
    "Showcase your art, Connect with opportunities, Grow with Artikin.",
    "Empowering artists with portfolios, connections, and real opportunities.",
    "A creative hub for artists to shine and organizations to discover talent.",
  ];
  const [currentWord, setCurrentWord] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const current = words[currentWord];
    let speed = pause ? 1000 : 120;

    const handleTyping = setTimeout(() => {
      if (!pause) {
        setDisplayedText(current.slice(0, displayedText.length + 1));
        if (displayedText === current) {
          setPause(true);
          setTimeout(() => {
            setPause(false);
            setCurrentWord((prev) => (prev + 1) % words.length);
            setDisplayedText("");
          }, 2000);
        }
      }
    }, speed);

    return () => clearTimeout(handleTyping);
  }, [displayedText, pause, words, currentWord]);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Contact Us", href: "#contact" },
  ];

  const artforms = [
    { title: "Acting", description: "Showcase your performances to casting directors and live audition calls.", image: actingSlide },
    { title: "Modeling", description: "Build a portfolio of your best shoots and connect with agencies.", image: modelingSlide },
    { title: "Singing", description: "Upload samples, get feedback, and land studio sessions.", image: singingSlide },
    { title: "Dance", description: "Share choreography reels and join collaborative projects.", image: danceSlide },
    { title: "Photography", description: "Display your gallery, find commissioned gigs, and network.", image: photographySlide },
    { title: "Videography", description: "Through the lens, emotions come alive, Stories aren’t told, they’re filmed.", image: videographySlide },
    { title: "Voice Artist", description: "Share your demos and audition for voice-over roles.", image: voiceSlide },
  ];

  const features = [
    { icon: Palette, title: "Portfolio Builder", description: "Create stunning portfolios with drag-and-drop media and customizable layouts to showcase your best work." },
    { icon: Briefcase, title: "Find Opportunities", description: "Discover casting calls, gigs, and projects that match your skills and artistic vision." },
    { icon: Users, title: "Build Your Network", description: "Connect with like-minded artists, collaborators, and industry professionals to grow your career." },
  ];

  const footerLinks = {
    Company: ["Home", "About", "Contact Us"],
    Legal: ["Privacy", "Terms", "Cookie Policy", "Licenses"]
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/artikinofficial?utm_source=ig_web_button_share_sheet&igsh=MmEzNzBucmF2Z28w", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const handleLogoClick = () => window.location.href = "/";

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/a487fdea-ba9d-4e8a-81e2-02c61e755218.png" alt="Artikin Logo" className="w-10 h-10 object-contain rounded-lg cursor-pointer" onClick={handleLogoClick} />
              <span onClick={handleLogoClick} className="font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer text-3xl">Artikin</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button key={link.name} onClick={() => handleNavClick(link.href)} className="text-foreground hover:text-primary transition-colors font-medium">{link.name}</button>
              ))}
            </nav>

            <div className="hidden md:block">
              <Button variant="default" onClick={() => navigate("/auth")} className="px-6 py-2 font-semibold text-base">Get Started</Button>
            </div>

            <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-accent/50 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border">
              <div className="px-4 py-3 space-y-2">
                {navLinks.map((link) => (
                  <button key={link.name} onClick={() => handleNavClick(link.href)} className="block w-full text-left py-3 px-3 rounded-xl hover:bg-accent/50 transition-colors font-medium">{link.name}</button>
                ))}
                <div className="pt-2">
                  <Button variant="default" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }} className="w-full font-semibold">Get Started</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section id="home" className="relative min-h-screen flex items-start md:items-center justify-center overflow-hidden pt-20 xs:pt-24 sm:pt-32 md:pt-0">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Connecting creativity
            <span className="block text-blue-400 animate-gradient-text">with Opportunity</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            From emerging creators to established talent, Artikin gives every artist a space to showcase their work and connect with the people.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button onClick={() => navigateWithScrollSave("/auth")} className="group bg-blue-400 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-500 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center">
              Join Artikin
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button onClick={() => window.open("https://youtu.be/lu58Um79-N4?si=g6JycaokuKJKDpcd", "Ayejude")} className="group flex items-center px-8 py-4 text-gray-700 font-semibold text-lg hover:text-blue-400 transition-colors duration-300">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mr-3 group-hover:shadow-xl transition-shadow duration-300">
                <Play className="w-5 h-5 text-blue-400 ml-1" />
              </div>
              Watch Trailer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[{ number: "1K+", label: "Users" }, { number: "99.9%", label: "Uptime" }, { number: "24/7", label: "Support" }].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHAT IS ARTIKIN ================= */}
      <section id="about" className="py-16 sm:py-20 lg:py-24 bg-background text-center">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-primary bg-clip-text text-transparent leading-tight">What is Artikin?</h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2">
            Artikin is a creative networking platform designed for artists to showcase their work, build meaningful connections, and discover opportunities with organizations. It acts as a bridge between creativity and industry, helping artists gain visibility while enabling organizations to find the right talent.
          </p>
        </div>
      </section>

      {/* ================= WHY ARTIKIN ================= */}
      <section id="why-humanoid" className="w-full h-screen py-0 md:py-0 overflow-hidden bg-white sticky top-0">
        <div className="container px-6 lg:px-8 mx-auto h-full flex flex-col">
          <div className="flex flex-col items-center">
            <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-1 md:mb-2 block text-blue-400 animate-gradient-text">Why Artikin?</h2>
            <div className="flex items-center gap-4 pt-8 sm:pt-6 md:pt-4">
              <div className="pulse-chip opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2"></span>
                <span>Artikin</span>
              </div>
            </div>
          </div>
          <div className="relative flex-1" style={{ minHeight: 340 }}>
            <div className="h-full rounded-3xl shadow-xl flex flex-col justify-center items-start px-14 py-12" style={{ background: "linear-gradient(90deg, #1d194aff 0%, #0073cf 100%)" }}>
              <div className="absolute top-6 right-6 z-20">
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium">The vision</div>
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-display text-white font-bold leading-tight mb-4">{displayedText}<span className="animate-blink ml-1">|</span></h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ART FORMS SLIDER ================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 bg-gradient-secondary bg-clip-text text-transparent leading-tight">Explore Art Forms</h2>
          <Swiper modules={[Navigation, Pagination, Autoplay]} slidesPerView={1} spaceBetween={20} navigation pagination={{ clickable: true }} autoplay={{ delay: 3000 }} breakpoints={{640:{slidesPerView:2},1024:{slidesPerView:3}}}>
            {artforms.map((art, index)=>(
              <SwiperSlide key={index}>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <img src={art.image} alt={art.title} className="w-full h-56 object-cover"/>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{art.title}</h3>
                    <p className="text-gray-600">{art.description}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* ================= SECONDARY CTA ================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30 text-center">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-foreground leading-tight">Start building your creative portfolio today</h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
            Connect with industry professionals and showcase your talent to the world.
          </p>
          <Button variant="default" size="lg" onClick={()=>navigateWithScrollSave("/auth")} className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold rounded-xl touch-manipulation">Create Your Profile</Button>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 bg-gradient-secondary bg-clip-text text-transparent leading-tight">Detailed Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-soft transition-all duration-200 hover:scale-[1.02] border-0 shadow-soft bg-background/80 backdrop-blur-sm p-6 sm:p-8">
                <CardHeader className="pb-4">
                  <a href="https://preview--artikin-artist.lovable.app/auth" target="_blank" rel="noopener noreferrer" className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center hover:scale-105 transition-transform">
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </a>
                  <CardTitle className="text-lg sm:text-xl font-bold leading-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-muted-foreground leading-relaxed text-sm sm:text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-20 bg-gradient-secondary text-white text-center">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to elevate your creative journey?</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">Join thousands of artists who are already building their careers on Artikin.</p>
          <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary font-semibold" onClick={()=>navigateWithScrollSave("/auth")}>Get Started</Button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4"><span className="text-2xl font-bold">Artikin</span></div>
              <p className="text-gray-400 mb-6 max-w-md">Bridging the gap between art and opportunity, Artikin empowers artists to display their work and collaborate with organizations worldwide.</p>
              <div className="space-y-3">
                <h4 className="font-semibold">Stay Updated</h4>
                <div className="flex space-x-2">
                  <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0073cf] focus:border-transparent"/>
                  <button className="bg-[#0073cf] hover:bg-[#005fa8] px-4 py-2 rounded-lg transition-colors duration-300"><Mail className="w-5 h-5"/></button>
                </div>
              </div>
            </div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold mb-4">{category}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (<li key={link}><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">{link}</a></li>))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 Artikin. All rights reserved.</p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="w-10 h-10 bg-gray-800 hover:bg-[#0073cf] rounded-lg flex items-center justify-center transition-colors duration-300" aria-label={social.label}>
                  <social.icon className="w-5 h-5"/>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
