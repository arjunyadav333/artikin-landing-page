import { Button } from "@/components/ui/button";
import { Heart, Mail, MessageCircle, Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Artikin</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              Connecting creativity with opportunity. Join thousands of artists, creators, and organizations building the future of creative collaboration.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:border-blue-300">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:border-blue-300">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:border-blue-300">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:border-blue-300">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><a href="/auth" className="text-gray-600 hover:text-blue-500 transition-colors">Sign Up</a></li>
              <li><a href="/opportunities" className="text-gray-600 hover:text-blue-500 transition-colors">Opportunities</a></li>
              <li><a href="/discover" className="text-gray-600 hover:text-blue-500 transition-colors">Discover Artists</a></li>
              <li><a href="/connections" className="text-gray-600 hover:text-blue-500 transition-colors">Connect</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="/help" className="text-gray-600 hover:text-blue-500 transition-colors">Help Center</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-blue-500 transition-colors">Contact Us</a></li>
              <li><a href="/privacy" className="text-gray-600 hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-600 hover:text-blue-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2024 Artikin. All rights reserved.
          </p>
          <div className="flex items-center text-gray-500 text-sm">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 mx-1 fill-current" />
            <span>for artists everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;