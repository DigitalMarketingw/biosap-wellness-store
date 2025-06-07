
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Star, ShoppingCart, Heart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const Home = () => {
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation Header */}
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-500 to-emerald-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <Leaf className="h-5 w-5" />
                <span className="text-sm font-medium">Pure Ayurvedic Wellness</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Natural Healing
                <span className="block text-yellow-300">for Modern Life</span>
              </h1>
              
              <p className="text-xl text-green-50 max-w-lg">
                Discover premium Ayurvedic products crafted with ancient wisdom and modern science. 
                Your journey to holistic wellness starts here.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-8">
                  Shop Now
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8">
                  Learn More
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm text-green-100">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-green-100">Natural Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5★</div>
                  <div className="text-sm text-green-100">Average Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-white/10 rounded-full blur-3xl absolute inset-0 transform scale-150"></div>
              <img 
                src="/placeholder.svg" 
                alt="Ayurvedic herbs and products"
                className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-green-800 mb-4">
              Wellness Categories
            </h2>
            <p className="text-lg text-green-600 max-w-2xl mx-auto">
              Explore our curated collection of Ayurvedic products organized by your wellness needs
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-green-800 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-green-600 max-w-2xl mx-auto">
              Handpicked premium Ayurvedic formulations for your holistic wellness journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">100% Natural</h3>
                <p className="text-green-600">
                  All our products are made from pure, organic herbs sourced directly from nature.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Premium Quality</h3>
                <p className="text-green-600">
                  Rigorous quality testing ensures every product meets our highest standards.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Fast Delivery</h3>
                <p className="text-green-600">
                  Quick and secure delivery to bring wellness products right to your doorstep.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6" />
                <span className="text-xl font-bold">BIOSAP</span>
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
    </div>
  );
};

export default Home;
