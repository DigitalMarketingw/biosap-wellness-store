
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartItem, CartContextType } from '@/types/cart';
import { cartService } from '@/services/cartService';
import { cartUtils } from '@/utils/cartUtils';
import { useCartOperations } from '@/hooks/useCartOperations';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { isLoading, handleCartOperation, addToCartWithCheck } = useCartOperations();

  const fetchCartItems = async () => {
    try {
      const cartItems = await cartService.fetchCartItems();
      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const addToCart = async (productId: string, quantity = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    await addToCartWithCheck(items, productId, quantity, updateQuantity, fetchCartItems);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    await handleCartOperation(
      () => cartService.updateItemQuantity(productId, quantity)
    );
    await fetchCartItems();
  };

  const removeFromCart = async (productId: string) => {
    await handleCartOperation(
      () => cartService.removeItem(productId),
      "Removed from cart,Item has been removed from your cart"
    );
    await fetchCartItems();
  };

  const clearCart = async () => {
    await handleCartOperation(() => cartService.clearCart());
    setItems([]);
  };

  const getTotalPrice = () => cartUtils.getTotalPrice(items);
  const getTotalItems = () => cartUtils.getTotalItems(items);
  const getItemInCart = (productId: string) => cartUtils.getItemInCart(items, productId);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchCartItems();
      } else {
        setItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotalPrice,
      getTotalItems,
      getItemInCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
