
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface ProductInfoProps {
  product: {
    name: string;
    description: string | null;
    benefits: string[] | null;
    rating: number | null;
    review_count: number | null;
  };
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;

  return (
    <>
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
    </>
  );
};

export default ProductInfo;
