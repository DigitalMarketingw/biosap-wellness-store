
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Search, Heart, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm border-b border-green-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800">BIOSAP</h1>
            <Badge variant="secondary" className="bg-green-100 text-green-700">Ayurvedic</Badge>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link to="/" className="text-green-700 hover:text-green-900 font-medium">Home</Link>
              <Link to="/products" className="text-green-700 hover:text-green-900 font-medium">Products</Link>
              <a href="#" className="text-green-700 hover:text-green-900 font-medium">Categories</a>
              <a href="#" className="text-green-700 hover:text-green-900 font-medium">Wellness</a>
              <a href="#" className="text-green-700 hover:text-green-900 font-medium">About</a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
              <Input 
                placeholder="Search natural products..." 
                className="pl-10 w-64 border-green-200 focus:border-green-400"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-800">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-800">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
