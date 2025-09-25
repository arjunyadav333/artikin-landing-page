import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Features", href: "#features" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/a487fdea-ba9d-4e8a-81e2-02c61e755218.png" 
              alt="Artikin Logo" 
              className="w-10 h-10 object-contain rounded-lg cursor-pointer" 
              onClick={() => navigate("/")} 
            />
            <span 
              onClick={() => navigate("/")} 
              className="font-bold text-primary cursor-pointer text-2xl font-inter"
            >
              Artikin
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => handleNavClick(link.href)} 
                className="text-foreground hover:text-primary transition-colors font-medium font-inter"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button 
              onClick={() => navigate("/auth")} 
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded-lg font-inter"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => (
                <button 
                  key={link.name} 
                  onClick={() => handleNavClick(link.href)} 
                  className="block w-full text-left py-3 px-3 rounded-xl hover:bg-gray-100 transition-colors font-medium font-inter"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-2">
                <Button 
                  onClick={() => { navigate("/auth"); setIsMenuOpen(false); }} 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold font-inter"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;