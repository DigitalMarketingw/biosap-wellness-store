
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/cart';

export const cartService = {
  async fetchCartItems(): Promise<CartItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products (
          id,
          name,
          price,
          image_urls,
          stock
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  },

  async addItem(productId: string, quantity: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity
      });

    if (error) throw error;
  },

  async updateItemQuantity(productId: string, quantity: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;
  },

  async removeItem(productId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;
  },

  async clearCart(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }
};
