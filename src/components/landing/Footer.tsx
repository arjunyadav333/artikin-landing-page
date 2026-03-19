import { Facebook, Twitter, Instagram, Linkedin, Mail, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    Company: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/#about' },
      { name: 'Contact Us', path: '/#contact' }
    ],
    Legal: [
      { name: 'Privacy Policy', path: '/legal/privacy-policy' },
      { name: 'Terms & Conditions', path: '/legal/terms-conditions' },
      { name: 'Community Guidelines', path: '/legal/community-guidelines' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/artikinofficial', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/artikinofficial', label: 'Twitter' },
    { icon: Instagram, href: 'https://www.instagram.com/artikinofficial?utm_source=ig_web_button_share_sheet&igsh=MmEzNzBucmF2Z28w', label: 'Instagram' },
    { icon: Youtube, href: 'https://www.youtube.com/@Artikinofficial', label: 'YouTube' },
    { icon: Linkedin, href: 'https://linkedin.com/company/artikin', label: 'LinkedIn' }
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <span className="text-2xl font-bold">Artikin</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Bridging the gap between art and opportunity, Artikin empowers artists to display their work and collaborate with organizations worldwide.
            </p>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h4 className="font-semibold">Stay Updated</h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0073cf] focus:border-transparent"
                />
                <button className="bg-[#0073cf] hover:bg-[#005fa8] px-4 py-2 rounded-lg transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors duration-300 whitespace-nowrap"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 Artikin. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300
                  bg-gray-800 text-white
                  ${social.label === "Facebook" ? "hover:bg-[#1877F2]" : ""}
                  ${social.label === "Twitter" ? "hover:bg-[#1DA1F2]" : ""}
                  ${social.label === "Instagram" ? "hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]" : ""}
                  ${social.label === "YouTube" ? "hover:bg-[#FF0000]" : ""}
                  ${social.label === "LinkedIn" ? "hover:bg-[#0A66C2]" : ""}
                `}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
