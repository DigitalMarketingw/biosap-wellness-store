
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cartService } from '@/services/cartService';
import { CartItem } from '@/types/cart';

export const useCartOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCartOperation = async (
    operation: () => Promise<void>,
    successMessage?: string,
    errorMessage?: string
  ) => {
    try {
      setIsLoading(true);
      await operation();
      if (successMessage) {
        toast({
          title: successMessage.split(',')[0],
          description: successMessage.split(',')[1] || '',
        });
      }
    } catch (error) {
      console.error('Cart operation error:', error);
      toast({
        title: errorMessage || "Error",
        description: "An error occurred while updating your cart",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCartWithCheck = async (
    items: CartItem[],
    productId: string,
    quantity: number,
    updateQuantity: (productId: string, quantity: number) => Promise<void>,
    refreshCart: () => Promise<void>
  ) => {
    const existingItem = items.find(item => item.product_id === productId);
    
    if (existingItem) {
      await updateQuantity(productId, existingItem.quantity + quantity);
      return;
    }

    await handleCartOperation(
      () => cartService.addItem(productId, quantity),
      "Added to cart,Item has been added to your cart"
    );
    await refreshCart();
  };

  return {
    isLoading,
    handleCartOperation,
    addToCartWithCheck
  };
};
