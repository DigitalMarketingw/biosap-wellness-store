
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { imageUtils } from '@/utils/imageUtils';

interface ProductImageProps {
  product: {
    id: string;
    name: string;
    image_urls: string[] | null;
    is_featured: boolean | null;
    stock?: number;
  };
  inWishlist: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  product, 
  inWishlist, 
  onToggleWishlist 
}) => {
  const imageUrl = imageUtils.getValidImageUrl(product.image_urls, product.name);

  return (
    <div className="relative overflow-hidden rounded-t-lg">
      <img 
        src={imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        onError={imageUtils.handleImageError}
        onLoad={imageUtils.handleImageLoad}
        loading="lazy"
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
        onClick={onToggleWishlist}
      >
        <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
};

export default ProductImage;
