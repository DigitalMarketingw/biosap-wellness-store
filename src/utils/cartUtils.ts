
import { CartItem } from '@/types/cart';

export const cartUtils = {
  getTotalPrice: (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  },

  getTotalItems: (items: CartItem[]): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  getItemInCart: (items: CartItem[], productId: string): CartItem | null => {
    return items.find(item => item.product_id === productId) || null;
  }
};
