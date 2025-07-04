
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Truck, Shield, RotateCcw } from 'lucide-react';

interface ProductInfoHeaderProps {
  product: {
    name: string;
    description: string | null;
    price: number;
    rating: number | null;
    review_count: number | null;
    benefits: string[] | null;
    is_featured: boolean | null;
    categories?: {
      name: string;
    };
  };
}

const ProductInfoHeader: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;

  return (
    <div className="space-y-6">
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
  );
};

export default ProductInfoHeader;
