
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Heart, ShoppingCart, ArrowLeft, Truck, Shield, RotateCcw, Info } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!products_category_id_fkey(name)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category_id],
    queryFn: async () => {
      if (!product?.category_id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .eq('is_active', true)
        .neq('id', id)
        .limit(4);
      
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_urls?.[0] || '/placeholder.svg'
      }, quantity);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_urls?.[0] || '/placeholder.svg'
      });
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="bg-green-200 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-green-200 h-8 rounded"></div>
                <div className="bg-green-200 h-6 rounded w-3/4"></div>
                <div className="bg-green-200 h-4 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-green-200">
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Product not found</h3>
              <p className="text-green-600 mb-4">
                The product you're looking for doesn't exist or is no longer available.
              </p>
              <Link to="/products">
                <Button className="bg-green-600 hover:bg-green-700">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const images = product.image_urls || ['/placeholder.svg'];
  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-green-600 mb-8">
          <Link to="/" className="hover:text-green-800">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-green-800">Products</Link>
          <span>/</span>
          {product.categories && (
            <>
              <span className="capitalize">{product.categories.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-green-800 font-medium">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link to="/products">
          <Button variant="ghost" className="mb-6 text-green-600 hover:text-green-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white border border-green-200">
              <img 
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-green-600' : 'border-green-200'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.categories && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 mb-2">
                  {product.categories.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-green-800 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${
                        i < Math.floor(rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="ml-2 text-green-600">
                    {rating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
                
                {product.is_featured && (
                  <Badge className="bg-yellow-500 text-white">Featured</Badge>
                )}
              </div>

              <div className="text-3xl font-bold text-green-800 mb-4">
                ₹{product.price.toLocaleString()}
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-3">Key Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {product.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="border-green-300 text-green-700">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-green-800">Quantity:</span>
                <div className="flex items-center border border-green-300 rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-green-50 text-green-600"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-green-50 text-green-600"
                  >
                    +
                  </button>
                </div>
                
                {product.stock && product.stock > 0 ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {product.stock} in stock
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Out of stock
                  </Badge>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleAddToCart}
                  disabled={!product.stock || product.stock === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleToggleWishlist}
                  className={`border-green-600 ${
                    isInWishlist(product.id) 
                      ? 'bg-green-600 text-white' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Truck className="h-4 w-4" />
                <span>Free shipping over ₹999</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>Quality guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <RotateCcw className="h-4 w-4" />
                <span>Easy returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="border-green-200 mb-16">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Ingredients */}
              {product.ingredients && (
                <div>
                  <h3 className="text-xl font-semibold text-green-800 mb-4">Ingredients</h3>
                  <p className="text-gray-600 leading-relaxed">{product.ingredients}</p>
                </div>
              )}

              {/* Usage Instructions */}
              {product.usage_instructions && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-xl font-semibold text-green-800 mb-4">Usage Instructions</h3>
                    <p className="text-gray-600 leading-relaxed">{product.usage_instructions}</p>
                  </div>
                </>
              )}

              {/* Return Policy */}
              <Separator className="my-6" />
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">Return & Refund Policy</h3>
                <div className="space-y-3 text-gray-600">
                  <p>• 30-day return policy for unopened products</p>
                  <p>• Full refund or exchange available</p>
                  <p>• Product must be in original packaging</p>
                  <p>• Return shipping costs may apply</p>
                  <p>• Perishable items cannot be returned</p>
                </div>
              </div>

              {/* Shipping Information */}
              <Separator className="my-6" />
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">Shipping Information</h3>
                <div className="space-y-3 text-gray-600">
                  <p>• Free shipping on orders over ₹999</p>
                  <p>• Standard delivery: 3-5 business days</p>
                  <p>• Express delivery: 1-2 business days (additional charges apply)</p>
                  <p>• All products are carefully packaged to ensure freshness</p>
                  <p>• Tracking information provided for all orders</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
