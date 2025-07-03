
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/2902c1b1-4f02-4a7c-8ea6-1f48a7664697.png" 
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
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <ul className="space-y-2 text-green-200">
              <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link to="/cancellation-refund" className="hover:text-white">Cancellation & Refund</Link></li>
              <li><Link to="/shipping-delivery" className="hover:text-white">Shipping & Delivery</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-green-200">
              <li><Link to="/contact" className="hover:text-white">Help & Support</Link></li>
              <li><Link to="/shipping-delivery" className="hover:text-white">Track Your Order</Link></li>
              <li><Link to="/cancellation-refund" className="hover:text-white">Returns</Link></li>
              <li><Link to="/contact" className="hover:text-white">Customer Care</Link></li>
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
