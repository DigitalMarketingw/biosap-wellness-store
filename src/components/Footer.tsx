import React from 'react';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/ab5ccc34-8661-4343-abac-8863eb7e8c1c.png" 
                alt="BIOSAP Logo" 
                className="h-6 w-auto filter brightness-0 invert"
              />
            </div>
            <p className="text-green-200 mb-4">
              Your trusted partner in Ayurvedic wellness, bringing ancient wisdom to modern life.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-green-200">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Products</a></li>
              <li><a href="#" className="hover:text-white">Wellness Blog</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-green-200">
              <li><a href="#" className="hover:text-white">Immunity</a></li>
              <li><a href="#" className="hover:text-white">Digestion</a></li>
              <li><a href="#" className="hover:text-white">Skin Care</a></li>
              <li><a href="#" className="hover:text-white">Energy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-green-200">
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Shipping</a></li>
              <li><a href="#" className="hover:text-white">Returns</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-200">
          <p>&copy; 2024 BIOSAP. All rights reserved. | Made with 💚 for your wellness</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
