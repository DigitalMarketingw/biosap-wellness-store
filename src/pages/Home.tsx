
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Star, ShoppingCart } from 'lucide-react';
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
    <div className="bg-gradient-to-b from-green-50 to-white">
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
                <Link to="/products">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-8">
                    Shop Now
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8">
                    Learn More
                  </Button>
                </Link>
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
            <Link to="/products">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                View All Products
              </Button>
            </Link>
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
    </div>
  );
};

export default Home;
