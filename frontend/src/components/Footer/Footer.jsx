import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-green-900 text-white relative overflow-hidden">
      {/* Safari pattern overlay */}
      {/* <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="jungle-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M20,20 Q30,5 40,20 T60,20" stroke="white" fill="none" />
            <path d="M0,40 Q10,25 20,40 T40,40" stroke="white" fill="none" />
            <path d="M40,60 Q50,45 60,60 T80,60" stroke="white" fill="none" />
            <circle cx="15" cy="15" r="2" fill="white" />
            <circle cx="55" cy="35" r="2" fill="white" />
            <circle cx="35" cy="55" r="2" fill="white" />
            <circle cx="65" cy="65" r="2" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#jungle-pattern)" />
        </svg>
      </div> */}
      
      {/* Main footer content */}
      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company logo and description */}
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 16C5 16 5 14 9 14C13 14 13 16 13 16V3C13 3 13 1 9 1C5 1 5 3 5 3V16Z" fill="#4ADE80" />
                <path d="M13 16C13 16 13 14 17 14C21 14 21 16 21 16V3C21 3 21 1 17 1C13 1 13 3 13 3" fill="#4ADE80" />
                <path d="M5 23C5 21.8954 8.58172 21 13 21C17.4183 21 21 21.8954 21 23" stroke="white" strokeWidth="2" />
                <path d="M5 16V23" stroke="white" strokeWidth="2" />
                <path d="M13 16V23" stroke="white" strokeWidth="2" />
                <path d="M21 16V23" stroke="white" strokeWidth="2" />
              </svg>
              <h2 className="text-xl font-bold">Jungle Safari</h2>
            </div>
            <p className="text-green-100 mb-4">
              Immerse yourself in an unforgettable jungle adventure with our expert guides and sustainable safari tours.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-green-700 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-green-100 hover:text-white transition">Home</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition">Safari Tours</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition">Wildlife Guide</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition">About Us</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition">Testimonials</a></li>
            </ul>
          </div>
          
          {/* Contact information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-green-700 pb-2">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>123 Wilderness Way, Safari Park, Adventure Land</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} />
                <span>+1 (234) 567-8910</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} />
                <span>info@wildtreksafaris.com</span>
              </li>
            </ul>
          </div>
          
          {/* Newsletter subscription */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-green-700 pb-2">
              Stay Connected
            </h3>
            <p className="text-green-100 mb-3">Subscribe for special offers and updates</p>
            <div className="flex mb-4">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-3 py-2 bg-green-800 border border-green-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-green-500 text-white w-full placeholder-green-300"
              />
              <button className="bg-green-600 hover:bg-green-500 transition px-4 py-2 rounded-r-md">
                Subscribe
              </button>
            </div>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-white hover:text-green-300 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-green-300 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-green-300 transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-green-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-green-200 text-sm">
            © {new Date().getFullYear()} Wild Trek Safaris. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-green-200 text-sm hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="text-green-200 text-sm hover:text-white transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;