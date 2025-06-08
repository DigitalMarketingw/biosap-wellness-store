
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Droplets, Coffee, Sparkles, Utensils, Flower } from 'lucide-react';
import { Link } from 'react-router-dom';

const Categories = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: productCounts } = useQuery({
    queryKey: ['category-product-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(product => {
        if (product.category_id) {
          counts[product.category_id] = (counts[product.category_id] || 0) + 1;
        }
      });
      
      return counts;
    }
  });

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('herb')) return Leaf;
    if (name.includes('oil')) return Droplets;
    if (name.includes('tea')) return Coffee;
    if (name.includes('skincare') || name.includes('skin')) return Sparkles;
    if (name.includes('spice')) return Utensils;
    return Flower;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-green-400 to-green-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="bg-green-200 h-32 rounded mb-4"></div>
                  <div className="bg-green-200 h-4 rounded mb-2"></div>
                  <div className="bg-green-200 h-3 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-green-100 text-green-700 mb-4">
              <Leaf className="h-4 w-4 mr-2" />
              Explore Our Collections
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Product Categories</h1>
            <p className="text-xl leading-relaxed">
              Discover our carefully curated selection of authentic Ayurvedic products, 
              organized by category to help you find exactly what you need for your wellness journey.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category, index) => {
                  const IconComponent = getCategoryIcon(category.name);
                  const productCount = productCounts?.[category.id] || 0;
                  
                  return (
                    <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 border-green-200 overflow-hidden">
                      <CardContent className="p-0">
                        <div className={`relative h-40 bg-gradient-to-br ${getCategoryColor(index)} flex items-center justify-center`}>
                          <IconComponent className="h-16 w-16 text-white opacity-90" />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-green-800 capitalize group-hover:text-green-600 transition-colors">
                              {category.name}
                            </h3>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {productCount} {productCount === 1 ? 'product' : 'products'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {category.description || 'Explore our premium selection of natural wellness products in this category.'}
                          </p>
                          
                          <Link to={`/products?category=${category.id}`}>
                            <Button 
                              variant="outline" 
                              className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                            >
                              View Products
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-green-200">
                <CardContent className="p-12 text-center">
                  <Leaf className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">No categories available</h3>
                  <p className="text-green-600 mb-4">
                    We're currently setting up our product categories. Please check back soon!
                  </p>
                  <Link to="/products">
                    <Button className="bg-green-600 hover:bg-green-700">
                      View All Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Educational Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-green-800 mb-6">Understanding Ayurvedic Categories</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Each category represents a different aspect of Ayurvedic wellness. From nourishing herbs 
              that support internal balance to therapeutic oils for external application, our products 
              are organized to help you create a comprehensive wellness routine tailored to your unique needs.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card className="border-green-200">
                <CardContent className="p-6 text-center">
                  <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Herbs & Supplements</h3>
                  <p className="text-gray-600 text-sm">
                    Traditional formulations and single herbs for internal wellness and balance
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-200">
                <CardContent className="p-6 text-center">
                  <Droplets className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Therapeutic Oils</h3>
                  <p className="text-gray-600 text-sm">
                    Specially formulated oils for massage, hair care, and topical applications
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Wellness Journey?</h2>
              <p className="text-xl mb-8 opacity-90">
                Browse our complete collection of authentic Ayurvedic products
              </p>
              <Link to="/products">
                <Button variant="secondary" size="lg" className="bg-white text-green-800 hover:bg-green-50">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
