import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const LegalFooter = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: "User Agreement", href: "/legal/terms-conditions" },
    { name: "Privacy Policy", href: "/legal/privacy-policy" },
    { name: "Community Guidelines", href: "/legal/community-guidelines" },
    { name: "About Us", href: "/about-us" },
    { name: "Support", href: "/support" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/artikinofficial", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/artikinofficial", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/artikinofficial", label: "Instagram" },
    { icon: Youtube, href: "https://www.youtube.com/@Artikinofficial", label: "YouTube" },
    { icon: Linkedin, href: "https://linkedin.com/company/artikin", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Copyright Section */}
          <div className="text-gray-500 text-sm font-medium order-3 md:order-1">
            © 2026 Artikin. All rights reserved.
          </div>

          {/* Links Section - One Row */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 order-1 md:order-2">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-500 hover:text-[#0073cf] text-sm font-semibold transition-colors whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4 order-2 md:order-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#0073cf] transition-all duration-300 transform hover:scale-110"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LegalFooter;
