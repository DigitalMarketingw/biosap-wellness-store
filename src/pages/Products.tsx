
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Handle URL category parameter
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('category', selectedCategory);
        return newParams;
      });
    } else {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('category');
        return newParams;
      });
    }
  }, [selectedCategory]);

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter(product => {
      // Search term filter
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;

      // Price range filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      // Availability filter
      const matchesAvailability = availability === 'all' || 
                                 (availability === 'in-stock' && product.stock > 0) ||
                                 (availability === 'out-of-stock' && product.stock === 0);

      return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, availability, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 10000]);
    setAvailability('all');
    setSortBy('name');
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== 'all' ? selectedCategory : null,
    priceRange[0] > 0 || priceRange[1] < 10000 ? 'price' : null,
    availability !== 'all' ? availability : null
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </h3>
                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear ({activeFiltersCount})
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium text-green-800 mb-2 block">
                      Search Products
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
                      <Input
                        placeholder="Search by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-green-200 focus:border-green-400"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-green-800 mb-2 block">
                      Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="border-green-200 focus:border-green-400">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-green-800 mb-2 block">
                      Price Range
                    </label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={10000}
                        min={0}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-green-600 mt-2">
                        <span>₹{priceRange[0].toLocaleString()}</span>
                        <span>₹{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="text-sm font-medium text-green-800 mb-2 block">
                      Availability
                    </label>
                    <Select value={availability} onValueChange={setAvailability}>
                      <SelectTrigger className="border-green-200 focus:border-green-400">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="text-green-700">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                  </Badge>
                )}
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="bg-green-200 h-48 rounded mb-4"></div>
                      <div className="bg-green-200 h-4 rounded mb-2"></div>
                      <div className="bg-green-200 h-3 rounded mb-4"></div>
                      <div className="bg-green-200 h-6 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="border-green-200">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">No products found</h3>
                  <p className="text-green-600 mb-4">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters} className="bg-green-600 hover:bg-green-700">
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
