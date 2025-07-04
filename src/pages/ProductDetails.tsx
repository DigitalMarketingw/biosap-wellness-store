
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import ProductBreadcrumb from '@/components/ProductBreadcrumb';
import ProductGallery from '@/components/ProductGallery';
import ProductInfoHeader from '@/components/ProductInfoHeader';
import ProductActions from '@/components/ProductActions';
import ProductDetailsTabs from '@/components/ProductDetailsTabs';
import RelatedProducts from '@/components/RelatedProducts';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, updateQuantity, getItemInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
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

  // Get cart item info
  const cartItem = product ? getItemInCart(product.id) : null;
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  // Sync quantity state with cart when product is in cart
  useEffect(() => {
    if (isInCart && cartQuantity > 0) {
      setQuantity(cartQuantity);
    }
  }, [isInCart, cartQuantity]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (product) {
      if (isInCart) {
        updateQuantity(product.id, newQuantity);
      } else {
        setQuantity(newQuantity);
      }
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
      addToWishlist(product.id);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <ProductBreadcrumb product={product} />

        {/* Back Button */}
        <Link to="/products">
          <Button variant="ghost" className="mb-6 text-green-600 hover:text-green-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <ProductGallery images={images} productName={product.name} />
          
          <div className="space-y-6">
            <ProductInfoHeader product={product} />
            
            <ProductActions
              product={product}
              quantity={quantity}
              isInCart={isInCart}
              cartQuantity={cartQuantity}
              isInWishlist={isInWishlist(product.id)}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
              onGoToCart={handleGoToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>
        </div>

        <ProductDetailsTabs product={product} />

        <RelatedProducts products={relatedProducts || []} />
      </div>
    </div>
  );
};

export default ProductDetails;
