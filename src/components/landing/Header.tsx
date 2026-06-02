import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppStoreButtons from './AppStoreButtons';
import artikinLogo from "@/assets/ARTIKIN_Header_Logo.png";

interface HeaderProps {
  isScrolled?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

const Header = ({ isScrolled = false, isMuted = true, onToggleMute }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isCareersPage = location.pathname.includes('/careers');
  const navigate = useNavigate();

  const [activeHash, setActiveHash] = useState(location.hash || (isHomePage ? "#home" : ""));

  useEffect(() => {
    if (!isHomePage) return;

    const handleScrollSpy = () => {
      const sections = ['home', 'about', 'contact'];
      let currentSection = '';

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

      if (isAtBottom) {
        currentSection = '#contact';
      } else {
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            // Active if center of section is in viewport view
            if (rect.top <= 150 && rect.bottom >= 150) {
              currentSection = `#${sectionId}`;
              break;
            }
          }
        }
      }

      if (currentSection) {
        setActiveHash(currentSection);
        if (currentSection === '#home') {
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          if (window.location.hash !== currentSection) {
            window.history.replaceState(null, '', currentSection);
          }
        }
      } else if (window.scrollY < 100) {
        setActiveHash("#home");
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    // Trigger initial spy check
    handleScrollSpy();

    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [isHomePage]);

  const isActive = (href: string) => {
    if (href === "/careers" && isCareersPage) return true;
    if (isHomePage) {
      if (href === "/careers") return false;
      return activeHash === href;
    }
    return false;
  };

  const navLinks = isCareersPage 
    ? [
        { name: "Home", href: "/" },
        { name: "About", href: "/#about" },
        { name: "Contact", href: "/#contact" },
        { name: "Careers", href: "/careers" }
      ]
    : isHomePage 
    ? [
        { name: "Home", href: "#home" },
        { name: "About", href: "#about" },
        { name: "Contact", href: "#contact" },
        { name: "Careers", href: "/careers" },
      ]
    : [
        { name: "User Agreement", href: "/legal/terms-conditions" },
        { name: "Privacy Policy", href: "/legal/privacy-policy" },
        { name: "Guidelines", href: "/legal/community-guidelines" },
        { name: "About Us", href: "/about-us" },
        { name: "Careers", href: "/careers" },
        { name: "Support", href: "/support" }
      ];

  const handleNavClick = (href: string) => {
    const [path, hash] = href.split('#');
    const isCurrentPath = path === location.pathname || path === "" || (path === '/careers' && location.pathname.startsWith('/careers'));

    if (hash && isCurrentPath) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsMenuOpen(false);
        return;
      }
    }

    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsMenuOpen(false);
      } else {
        navigate('/' + href);
      }
    } else {
      navigate(href);
      setIsMenuOpen(false);
    }
  };

  return <header
    className="fixed z-50 transition-all duration-500 ease-out"
    style={{
      top: isScrolled ? '16px' : '0px',
      left: isScrolled ? '16px' : '0px',
      right: isScrolled ? '16px' : '0px',
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
      borderRadius: isScrolled ? '20px' : '0px',
      border: isScrolled ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid transparent',
      boxShadow: isScrolled ? '0 10px 40px -10px rgba(0, 0, 0, 0.1)' : 'none',
    }}
  >
    <div className="px-4 sm:px-6 lg:px-8">
      <div className={`flex items-center justify-between transition-all duration-500 ${
        isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
      }`}>
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center"
          onClick={() => {
            if (window.location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <img
            src={artikinLogo}
            alt="Artikin Logo"
            className={`h-8 sm:h-10 w-auto object-contain cursor-pointer transition-all duration-300 ${
              isScrolled ? '' : 'brightness-0 invert'
            }`}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => {
            const active = isActive(link.href);
            return (
              <button 
                key={link.name} 
                onClick={() => handleNavClick(link.href)} 
                className={`font-medium transition-colors duration-300 relative py-1 ${
                  active
                    ? isScrolled
                      ? 'text-primary font-bold'
                      : 'text-white font-bold border-b-2 border-white'
                    : isScrolled
                      ? 'text-foreground hover:text-primary'
                      : 'text-white/85 hover:text-white'
                }`}
              >
                {link.name}
                {active && isScrolled && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop CTA + Sound Button */}
        <div className="hidden md:flex items-center gap-3">
          {/* Sound Toggle Button */}
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                isScrolled
                  ? 'text-foreground hover:bg-accent/50'
                  : 'text-white hover:bg-white/20'
              }`}
              title={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}
          {isCareersPage ? (
            <Button 
              variant="default"
              size="sm"
              className={`rounded-full px-6 font-bold shadow-lg transition-all ${
                isScrolled 
                ? "bg-primary text-white shadow-primary/20" 
                : "bg-white text-primary shadow-white/10"
              }`}
              onClick={() => handleNavClick('/careers#roles')}
            >
              Search Jobs
            </Button>
          ) : (
            <AppStoreButtons iconOnly dark={isScrolled ? false : true} />
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Sound Toggle */}
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                isScrolled
                  ? 'text-foreground hover:bg-accent/50'
                  : 'text-white hover:bg-white/20'
              }`}
              title={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}
          <button className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
            isScrolled
              ? 'hover:bg-accent/50 text-foreground'
              : 'hover:bg-white/20 text-white'
          }`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border border-border shadow-lg"
        style={{
          borderRadius: isScrolled ? '0 0 20px 20px' : '0',
          marginTop: isScrolled ? '4px' : '0',
        }}
      >
        <div className="px-4 py-3 space-y-2">
          {navLinks.map(link => {
            const active = isActive(link.href);
            return (
              <button 
                key={link.name} 
                onClick={() => handleNavClick(link.href)} 
                className={`block w-full text-left py-3 px-3 rounded-xl hover:bg-accent/50 transition-colors font-medium ${
                  active ? 'text-primary font-bold bg-accent/30' : 'text-foreground'
                }`}
              >
                {link.name}
              </button>
            );
          })}
          <div className="pt-4 pb-2 flex justify-center border-t border-border mt-2">
            {isCareersPage ? (
              <Button 
                className="w-full bg-primary text-white rounded-xl font-bold"
                onClick={() => {
                  handleNavClick('/careers#roles');
                }}
              >
                Search Jobs
              </Button>
            ) : (
              <AppStoreButtons iconOnly dark={false} />
            )}
          </div>
        </div>
      </div>}
    </div>
  </header>;
};

export default Header;