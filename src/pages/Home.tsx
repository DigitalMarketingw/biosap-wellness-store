
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Star, ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import HeroCarousel from '@/components/HeroCarousel';
import ProductBanner from '@/components/ProductBanner';

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
      {/* Hero Carousel */}
      <HeroCarousel />

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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* MindMuse Banner */}
      <div className="container mx-auto px-4">
        <ProductBanner />
      </div>

      {/* Product Showcase Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-green-800 mb-4">
              Our Premium Product Range
            </h2>
            <p className="text-lg text-green-600 max-w-2xl mx-auto">
              Discover the power of nature with our scientifically formulated Ayurvedic solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-pink-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src="/lovable-uploads/df78a984-412e-4645-b1d7-1ed1b8aacd7b.png" 
                    alt="FEMVIT BRU - Women's Wellness Support with Natural Herbal Ingredients"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-pink-600 mb-2">Women's Wellness</h3>
                  <p className="text-gray-600 text-sm">
                    FEMVIT BRU provides comprehensive support for women's health with carefully selected natural ingredients.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src="/lovable-uploads/1b0830d9-a2f7-49d9-9dbf-f738f13913fc.png" 
                    alt="SmokyGinger - Green Tea & Ginger Instant Herbal Infusion for Digestive Health"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-yellow-600 mb-2">Digestive Health</h3>
                  <p className="text-gray-600 text-sm">
                    SmokyGinger's Green Tea and Ginger blend supports healthy digestion and provides soothing thermal comfort.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src="/lovable-uploads/1aa37669-de0f-422b-81df-fabede344482.png" 
                    alt="CoolDetox - Coriander Mint Ginger Natural Detox Infusion"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-green-600 mb-2">Natural Detox</h3>
                  <p className="text-gray-600 text-sm">
                    CoolDetox features Coriander, Mint, and Ginger for natural cleansing and rejuvenation.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src="/lovable-uploads/280833e3-0bcb-4a9d-81b7-bd98ee95388a.png" 
                    alt="DigestEase - Fennel Lemon Instant Herbal Infusion for Digestive Health"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-blue-600 mb-2">Digestive Wellness</h3>
                  <p className="text-gray-600 text-sm">
                    DigestEase combines Fennel and Lemon for effective digestive cleanse and soothing relief.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-green-50">
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
