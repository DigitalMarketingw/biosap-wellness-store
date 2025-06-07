
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';

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
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = product.image_urls?.[0] || '/placeholder.svg';
  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-green-100 hover:border-green-300">
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
          
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-green-600 hover:text-red-500"
          >
            <Heart className="h-4 w-4" />
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
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
