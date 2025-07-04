
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    stock: number | null;
  };
  quantity: number;
  isInCart: boolean;
  cartQuantity: number;
  isInWishlist: boolean;
  onQuantityChange: (newQuantity: number) => void;
  onAddToCart: () => void;
  onGoToCart: () => void;
  onToggleWishlist: () => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  quantity,
  isInCart,
  cartQuantity,
  isInWishlist,
  onQuantityChange,
  onAddToCart,
  onGoToCart,
  onToggleWishlist
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="font-medium text-green-800">Quantity:</span>
        <div className="flex items-center border border-green-300 rounded-lg">
          <button 
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-green-50 text-green-600"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-2 font-medium">{quantity}</span>
          <button 
            onClick={() => onQuantityChange(quantity + 1)}
            className="p-2 hover:bg-green-50 text-green-600"
            disabled={product.stock !== null && quantity >= product.stock}
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
        {isInCart ? (
          <Button 
            onClick={onGoToCart}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Go to Cart ({cartQuantity} in cart)
          </Button>
        ) : (
          <Button 
            onClick={onAddToCart}
            disabled={!product.stock || product.stock === 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={onToggleWishlist}
          className={`border-green-600 ${
            isInWishlist 
              ? 'bg-green-600 text-white' 
              : 'text-green-600 hover:bg-green-50'
          }`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default ProductActions;
