
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductCartActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock?: number;
  };
  isInCart: boolean;
  cartQuantity: number;
  onAddToCart: (e: React.MouseEvent) => void;
  onGoToCart: (e: React.MouseEvent) => void;
  onQuantityUpdate: (e: React.MouseEvent, newQuantity: number) => void;
}

const ProductCartActions: React.FC<ProductCartActionsProps> = ({
  product,
  isInCart,
  cartQuantity,
  onAddToCart,
  onGoToCart,
  onQuantityUpdate
}) => {
  const isMobile = useIsMobile();
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="text-2xl font-bold text-green-800">
        ₹{product.price.toLocaleString()}
      </div>
      
      <div className="flex flex-col items-end space-y-2">
        {isInCart && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-green-300"
              onClick={(e) => onQuantityUpdate(e, cartQuantity - 1)}
              disabled={product.stock !== undefined && product.stock === 0}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium min-w-[1.5rem] text-center">
              {cartQuantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-green-300"
              onClick={(e) => onQuantityUpdate(e, cartQuantity + 1)}
              disabled={product.stock !== undefined && cartQuantity >= product.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {isInCart ? (
          <Button 
            size={isMobile ? "icon" : "sm"}
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onGoToCart}
            aria-label={isMobile ? "Go to Cart" : undefined}
          >
            <ShoppingCart className="h-4 w-4" />
            {!isMobile && <span className="ml-1">Go to Cart</span>}
          </Button>
        ) : (
          <Button 
            size={isMobile ? "icon" : "sm"}
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onAddToCart}
            disabled={product.stock !== undefined && product.stock === 0}
            aria-label={isMobile ? "Add to Cart" : undefined}
          >
            <ShoppingCart className="h-4 w-4" />
            {!isMobile && <span className="ml-1">Add to Cart</span>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCartActions;
