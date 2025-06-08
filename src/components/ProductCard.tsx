
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_urls: string[] | null;
    rating: number | null;
    review_count: number | null;
    benefits: string[] | null;
    is_featured: boolean | null;
    stock?: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const imageUrl = product.image_urls?.[0] || '/placeholder.svg';
  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product.id);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
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

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 border-green-100 hover:border-green-300 h-full">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img 
              src={imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {product.is_featured && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                Featured
              </Badge>
            )}

            {product.stock !== undefined && product.stock === 0 && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                Out of Stock
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              className={`absolute top-2 right-2 bg-white/80 hover:bg-white transition-colors ${
                inWishlist 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-green-600 hover:text-red-500'
              }`}
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-green-800 group-hover:text-green-600 transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-green-600 line-clamp-2 mt-1">
                {product.description}
              </p>
            </div>
            
            {product.benefits && product.benefits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.benefits.slice(0, 2).map((benefit, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    {benefit}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-green-600">
                  ({reviewCount})
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="text-2xl font-bold text-green-800">
                ₹{product.price.toLocaleString()}
              </div>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddToCart}
                disabled={product.stock !== undefined && product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
