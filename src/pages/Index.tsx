import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Play, Palette, Briefcase, Users, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // typing effect
  const words = [
    "Showcase your art, connect with opportunities.",
    "Empowering artists with portfolios, connections, and real opportunities.",
    "A creative hub for artists to shine and organizations to discover talent.",
  ];
  const [currentWord, setCurrentWord] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const current = words[currentWord];
    if (pause) return;
    const timeout = setTimeout(() => {
      const nextText = current.slice(0, displayedText.length + 1);
      setDisplayedText(nextText);
      if (nextText === current) {
        setPause(true);
        setTimeout(() => {
          setPause(false);
          setCurrentWord((prev) => (prev + 1) % words.length);
          setDisplayedText("");
        }, 2000);
      }
    }, 120);
    return () => clearTimeout(timeout);
  }, [displayedText, pause, currentWord]);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  const artforms = [
    { title: "Acting", image: "https://source.unsplash.com/400x250/?actor" },
    { title: "Modeling", image: "https://source.unsplash.com/400x250/?model" },
    { title: "Singing", image: "https://source.unsplash.com/400x250/?singing" },
    { title: "Dance", image: "https://source.unsplash.com/400x250/?dance" },
    { title: "Photography", image: "https://source.unsplash.com/400x250/?photography" },
    { title: "Videography", image: "https://source.unsplash.com/400x250/?videography" },
    { title: "Voice Artist", image: "https://source.unsplash.com/400x250/?voice" },
  ];

  const features = [
    { icon: Palette, title: "Portfolio Builder", description: "Create stunning portfolios with drag-and-drop media." },
    { icon: Briefcase, title: "Find Opportunities", description: "Discover casting calls, gigs, and projects." },
    { icon: Users, title: "Build Your Network", description: "Connect with artists and industry professionals." },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const handleNavClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="font-sans">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <span className="text-2xl font-bold cursor-pointer">Artikin</span>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <button key={link.name} onClick={() => handleNavClick(link.href)} className="hover:text-blue-500">
                {link.name}
              </button>
            ))}
          </nav>
          <button className="hidden md:inline bg-blue-500 text-white px-4 py-2 rounded">Get Started</button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <button key={link.name} onClick={() => handleNavClick(link.href)} className="block w-full text-left py-2 hover:bg-gray-100 rounded">
                {link.name}
              </button>
            ))}
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded">Get Started</button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="home" className="min-h-screen flex flex-col justify-center items-center text-center bg-gray-50 pt-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Connecting creativity <span className="text-blue-500">with Opportunity</span></h1>
        <h3 className="text-xl md:text-2xl mb-6">{displayedText}<span className="animate-pulse">|</span></h3>
        <div className="flex gap-4">
          <button className="bg-blue-500 text-white px-6 py-3 rounded">Join Artikin <ArrowRight className="inline ml-2"/></button>
          <button className="flex items-center px-6 py-3 border rounded hover:text-blue-500">
            <Play className="mr-2"/> Watch Trailer
          </button>
        </div>
      </section>

      {/* ART FORMS SLIDER */}
      <section className="py-16 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-12">Explore Art Forms</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={1}
          spaceBetween={20}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        >
          {artforms.map((art, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <img src={art.image} alt={art.title} className="w-full h-48 object-cover" loading="lazy"/>
                <div className="p-4">
                  <h3 className="font-bold">{art.title}</h3>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Detailed Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition">
              <feature.icon className="w-10 h-10 text-blue-500 mx-auto mb-4"/>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 Artikin. All rights reserved.</p>
          <div className="flex gap-3 mt-4 md:mt-0">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} aria-label={social.label} className="p-2 bg-gray-800 rounded hover:bg-blue-500">
                <social.icon className="w-5 h-5"/>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
