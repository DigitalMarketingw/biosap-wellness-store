
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Package, AlertTriangle, Plus, Minus, Search, Truck } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  reorder_point: number;
  reorder_quantity: number;
  price: number;
}

interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  reason: string;
  created_at: string;
  products: {
    name: string;
    sku: string | null;
  };
}

const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: '',
    reason: '',
    type: 'in' as 'in' | 'out'
  });
  const { toast } = useToast();
  const { logAdminActivity } = useAdmin();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      // Fetch products with stock info
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, stock, reorder_point, reorder_quantity, price')
        .eq('is_active', true)
        .order('name');

      if (productsError) throw productsError;

      // Fetch recent inventory movements
      const { data: movementsData, error: movementsError } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          products!inner(name, sku)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (movementsError) throw movementsError;

      setProducts(productsData || []);
      setMovements(movementsData || []);
      await logAdminActivity('view', 'inventory');
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !adjustmentData.quantity || !adjustmentData.reason) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    const adjustmentQuantity = parseInt(adjustmentData.quantity);
    if (isNaN(adjustmentQuantity) || adjustmentQuantity <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid positive quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      const movementType = adjustmentData.type;
      const finalQuantity = movementType === 'in' ? adjustmentQuantity : -adjustmentQuantity;
      const newStock = selectedProduct.stock + finalQuantity;

      if (newStock < 0) {
        toast({
          title: "Error",
          description: "Cannot reduce stock below zero",
          variant: "destructive",
        });
        return;
      }

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // Record inventory movement
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          product_id: selectedProduct.id,
          movement_type: movementType,
          quantity: adjustmentQuantity,
          reason: adjustmentData.reason,
          reference_type: 'manual_adjustment'
        });

      if (movementError) throw movementError;

      await logAdminActivity('update', 'inventory', selectedProduct.id, {
        type: movementType,
        quantity: adjustmentQuantity,
        reason: adjustmentData.reason
      });

      toast({
        title: "Success",
        description: "Stock adjusted successfully",
      });

      setShowAdjustment(false);
      setSelectedProduct(null);
      setAdjustmentData({ quantity: '', reason: '', type: 'in' });
      fetchInventoryData();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
    }
  };

  const isLowStock = (product: Product) => product.stock <= product.reorder_point;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockProducts = products.filter(isLowStock);

  if (loading) {
    return <div className="p-6">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Monitor and manage product stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          {lowStockProducts.length > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {lowStockProducts.length} Low Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Form */}
      {showAdjustment && selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Adjust Stock - {selectedProduct.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStockAdjustment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Adjustment Type</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant={adjustmentData.type === 'in' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAdjustmentData({ ...adjustmentData, type: 'in' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Stock In
                    </Button>
                    <Button
                      type="button"
                      variant={adjustmentData.type === 'out' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAdjustmentData({ ...adjustmentData, type: 'out' })}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Stock Out
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  placeholder="Reason for adjustment (e.g., damaged goods, new stock)"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Adjust Stock
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAdjustment(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert ({lowStockProducts.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="p-3 bg-white rounded border border-orange-200">
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="destructive" className="text-xs">
                      {product.stock} remaining
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowAdjustment(true);
                      }}
                    >
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Overview ({filteredProducts.length} products)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchTerm ? 'No products found matching your search.' : 'No products found.'}
              </p>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Price: ${product.price}</p>
                      <p className="text-sm text-gray-600">
                        Reorder Point: {product.reorder_point}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">{product.stock}</p>
                      <p className="text-xs text-gray-500">units in stock</p>
                    </div>
                    {isLowStock(product) && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Stock
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowAdjustment(true);
                      }}
                    >
                      Adjust
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Recent Inventory Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {movements.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent movements</p>
            ) : (
              movements.slice(0, 10).map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{movement.products.name}</p>
                    <p className="text-sm text-gray-600">{movement.reason}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={movement.movement_type === 'in' ? 'default' : 'secondary'}
                      className={movement.movement_type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    >
                      {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(movement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
