import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import artikinLogo from "@/assets/ARTIKIN_Header_Logo.png";

const LegalHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navLinks = [
    { name: "User Agreement", href: "/legal/terms-conditions" },
    { name: "Privacy Policy", href: "/legal/privacy-policy" },
    { name: "Community Guidelines", href: "/legal/community-guidelines" },
    { name: "About Us", href: "/about-us" },
    { name: "Support", href: "/support" }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center transition-opacity hover:opacity-90">
            <img
              src={artikinLogo}
              alt="Artikin Logo"
              className="h-8 md:h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`relative text-sm font-semibold transition-all duration-300 hover:text-[#0073cf] pb-1 ${isActive(link.href)
                  ? "text-[#0073cf] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#0073cf]"
                  : "text-gray-500 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#0073cf] hover:after:w-full after:transition-all"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} className="animate-in fade-in zoom-in" /> : <Menu size={22} className="animate-in fade-in zoom-in" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[500px] border-t border-gray-100 pb-6 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="pt-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200 ${isActive(link.href)
                  ? "bg-[#0073cf]/5 text-[#0073cf]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#0073cf]"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default LegalHeader;
