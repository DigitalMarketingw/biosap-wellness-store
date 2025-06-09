
import { supabase } from '@/integrations/supabase/client';

export interface ProductReference {
  table: string;
  count: number;
  description: string;
}

export interface ProductDeletionCheck {
  canDelete: boolean;
  references: ProductReference[];
  totalReferences: number;
}

export const checkProductReferences = async (productId: string): Promise<ProductDeletionCheck> => {
  try {
    // Check all tables that reference this product
    const checks = await Promise.all([
      // Check cart items
      supabase
        .from('cart_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId),
      
      // Check wishlist items
      supabase
        .from('wishlist_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId),
      
      // Check order items
      supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId),
      
      // Check inventory movements
      supabase
        .from('inventory_movements')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId),
    ]);

    const references: ProductReference[] = [];
    
    if (checks[0].count && checks[0].count > 0) {
      references.push({
        table: 'cart_items',
        count: checks[0].count,
        description: `${checks[0].count} cart item(s)`
      });
    }
    
    if (checks[1].count && checks[1].count > 0) {
      references.push({
        table: 'wishlist_items',
        count: checks[1].count,
        description: `${checks[1].count} wishlist item(s)`
      });
    }
    
    if (checks[2].count && checks[2].count > 0) {
      references.push({
        table: 'order_items',
        count: checks[2].count,
        description: `${checks[2].count} order item(s)`
      });
    }
    
    if (checks[3].count && checks[3].count > 0) {
      references.push({
        table: 'inventory_movements',
        count: checks[3].count,
        description: `${checks[3].count} inventory movement(s)`
      });
    }

    const totalReferences = references.reduce((sum, ref) => sum + ref.count, 0);
    
    return {
      canDelete: totalReferences === 0,
      references,
      totalReferences
    };
  } catch (error) {
    console.error('Error checking product references:', error);
    throw error;
  }
};

export const forceDeleteProduct = async (productId: string): Promise<void> => {
  try {
    // Delete references in correct order (child tables first)
    await Promise.all([
      supabase.from('cart_items').delete().eq('product_id', productId),
      supabase.from('wishlist_items').delete().eq('product_id', productId),
    ]);
    
    // Note: We don't delete order_items and inventory_movements as they are historical records
    // Instead, we'll just deactivate the product if these exist
    
    // Finally delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error force deleting product:', error);
    throw error;
  }
};

export const softDeleteProduct = async (productId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error soft deleting product:', error);
    throw error;
  }
};
