import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogoClick = () => {
    window.location.href = "/";
  };
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/a487fdea-ba9d-4e8a-81e2-02c61e755218.png" alt="Artikin Logo" className="w-10 h-10 object-contain rounded-lg cursor-pointer" onClick={handleLogoClick} />
            <span onClick={handleLogoClick} className="font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer text-3xl">
              Artikin
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => <button key={link.name} onClick={() => handleNavClick(link.href)} className="text-foreground hover:text-primary transition-colors font-medium">
                {link.name}
              </button>)}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <Button variant="default" onClick={() => navigate("/auth")} className="px-6 py-2 font-semibold text-base">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-accent/50 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map(link => <button key={link.name} onClick={() => handleNavClick(link.href)} className="block w-full text-left py-3 px-3 rounded-xl hover:bg-accent/50 transition-colors font-medium">
                  {link.name}
                </button>)}
              <div className="pt-2">
                <Button variant="default" onClick={() => {
              navigate("/auth");
              setIsMenuOpen(false);
            }} className="w-full font-semibold">
                  Get Started
                </Button>
              </div>
            </div>
          </div>}
      </div>
    </header>;
};

export default Header;