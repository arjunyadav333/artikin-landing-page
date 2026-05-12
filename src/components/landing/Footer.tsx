import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppStoreButtons from './AppStoreButtons';
import artikinLogo from "@/assets/ARTIKIN_Header_Logo.png";

const Footer = () => {
  const footerLinks = {
    Platform: [
      { name: 'Home', path: '/' },
      { name: 'About Artikin', path: '/about-us' },
      { name: 'How it Works', path: '#how-it-works' },
      { name: 'Contact Support', path: '/support' }
    ],
    Legal: [
      { name: 'Privacy Policy', path: '/legal/privacy-policy' },
      { name: 'Terms of Service', path: '/legal/terms-conditions' },
      { name: 'Community Guidelines', path: '/legal/community-guidelines' },
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/artikinofficial', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/artikinofficial', label: 'Twitter' },
    { icon: Instagram, href: 'https://www.instagram.com/artikinofficial', label: 'Instagram' },
    { icon: Youtube, href: 'https://www.youtube.com/@Artikinofficial', label: 'YouTube' },
    { icon: Linkedin, href: 'https://linkedin.com/company/artikin', label: 'LinkedIn' }
  ];

  return (
    <footer id="contact" className="bg-white border-t border-slate-100 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-24 mb-16">
          {/* Brand Info */}
          <div className="max-w-sm">
            <Link 
              to="/" 
              className="inline-block mb-6"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img 
                src={artikinLogo} 
                alt="Artikin Official Logo" 
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-500 text-base leading-relaxed mb-6">
              The professional networking platform designed exclusively for the creative industry. Connect, showcase, and grow.
            </p>
            <div className="mb-8">
              <a href="mailto:support@artikin.com" className="text-blue-500 hover:text-blue-600 font-bold text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@artikin.com
              </a>
            </div>
            <div className="flex items-center gap-4">
              <AppStoreButtons dark={false} iconOnly={false} className="scale-90 origin-left" />
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-12 sm:gap-24 lg:gap-32">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-6">{category}</h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-slate-500 hover:text-blue-500 transition-colors text-base font-medium inline-block relative group"
                        onClick={() => {
                          if (link.path.startsWith('#')) {
                            document.querySelector(link.path)?.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                      >
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter / Contact */}
          <div className="w-full lg:max-w-xs">
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-6">Newsletter</h4>
            <p className="text-slate-500 text-sm mb-4">Get the latest updates from Artikin</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address"
                className="flex-1 h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
              <button className="h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/20">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>© 2025 Artikin Official.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs">Proudly built for the global creative community.</span>
          </div>

          {/* Minimalist Socials */}
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                className="text-slate-400 hover:text-blue-500 transition-colors duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
