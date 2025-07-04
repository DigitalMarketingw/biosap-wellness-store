
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useProductCard } from '@/hooks/useProductCard';
import ProductImage from '@/components/ProductImage';
import ProductInfo from '@/components/ProductInfo';
import ProductCartActions from '@/components/ProductCartActions';

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
  const {
    inWishlist,
    isInCart,
    cartQuantity,
    handleAddToCart,
    handleGoToCart,
    handleQuantityUpdate,
    handleToggleWishlist
  } = useProductCard(product);

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 border-green-100 hover:border-green-300 h-full">
        <CardContent className="p-0">
          <ProductImage
            product={product}
            inWishlist={inWishlist}
            onToggleWishlist={handleToggleWishlist}
          />
          
          <div className="p-4 space-y-3">
            <ProductInfo product={product} />
            
            <ProductCartActions
              product={product}
              isInCart={isInCart}
              cartQuantity={cartQuantity}
              onAddToCart={handleAddToCart}
              onGoToCart={handleGoToCart}
              onQuantityUpdate={handleQuantityUpdate}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
