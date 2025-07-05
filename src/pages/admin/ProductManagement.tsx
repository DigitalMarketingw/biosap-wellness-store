import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddProductDialog from '@/components/admin/AddProductDialog';
import EditProductDialog from '@/components/admin/EditProductDialog';
import BulkUploadDialog from '@/components/admin/BulkUploadDialog';
import ProductDeletionDialog from '@/components/admin/ProductDeletionDialog';
import ImageDebugger from '@/components/ImageDebugger';
import { checkProductReferences, forceDeleteProduct, softDeleteProduct, ProductDeletionCheck } from '@/utils/productDeletion';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  category_id: string;
  categories?: { name: string };
  reorder_point: number;
  description: string;
  supplier_id: string | null;
  reorder_quantity: number;
  image_urls: string[];
  ingredients: string;
  usage_instructions: string;
  benefits: string[];
}

const ProductManagement = () => {
  const { logAdminActivity } = useAdmin();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletionCheck, setDeletionCheck] = useState<ProductDeletionCheck | null>(null);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [showImageDebugger, setShowImageDebugger] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!products_category_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      await logAdminActivity('view', 'products');
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      await fetchProducts();
      await logAdminActivity('update', 'products', productId, { 
        action: currentStatus ? 'deactivated' : 'activated' 
      });
      
      toast({
        title: "Success",
        description: `Product ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const initiateDeleteProduct = async (product: Product) => {
    setProductToDelete(product);
    setDeletionLoading(true);
    
    try {
      const check = await checkProductReferences(product.id);
      setDeletionCheck(check);
      setShowDeletionDialog(true);
    } catch (error) {
      console.error('Error checking product references:', error);
      toast({
        title: "Error",
        description: "Failed to check product references",
        variant: "destructive",
      });
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    setDeletionLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      await fetchProducts();
      await logAdminActivity('delete', 'products', productToDelete.id);
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      setShowDeletionDialog(false);
      setProductToDelete(null);
      setDeletionCheck(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleForceDelete = async () => {
    if (!productToDelete) return;
    
    setDeletionLoading(true);
    try {
      await forceDeleteProduct(productToDelete.id);
      await fetchProducts();
      await logAdminActivity('delete', 'products', productToDelete.id, { type: 'force_delete' });
      
      toast({
        title: "Success",
        description: "Product force deleted successfully",
      });
      
      setShowDeletionDialog(false);
      setProductToDelete(null);
      setDeletionCheck(null);
    } catch (error) {
      console.error('Error force deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to force delete product",
        variant: "destructive",
      });
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!productToDelete) return;
    
    setDeletionLoading(true);
    try {
      await softDeleteProduct(productToDelete.id);
      await fetchProducts();
      await logAdminActivity('update', 'products', productToDelete.id, { type: 'soft_delete' });
      
      toast({
        title: "Success",
        description: "Product deactivated successfully",
      });
      
      setShowDeletionDialog(false);
      setProductToDelete(null);
      setDeletionCheck(null);
    } catch (error) {
      console.error('Error deactivating product:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate product",
        variant: "destructive",
      });
    } finally {
      setDeletionLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get all image URLs for debugging
  const allImageUrls = products.flatMap(product => product.image_urls || []);

  if (loading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your Ayurvedic products inventory</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowImageDebugger(!showImageDebugger)}
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            {showImageDebugger ? 'Hide' : 'Show'} Image Debug
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowBulkUploadDialog(true)}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Image Debug Section */}
      {showImageDebugger && allImageUrls.length > 0 && (
        <ImageDebugger 
          imageUrls={allImageUrls} 
          title={`All Product Images (${allImageUrls.length} total)`}
        />
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>SKU: {product.sku || 'N/A'}</span>
                      <span>Price: ${Number(product.price).toFixed(2)}</span>
                      <span>Stock: {product.stock || 0}</span>
                      {product.categories && (
                        <Badge variant="outline">{product.categories.name}</Badge>
                      )}
                    </div>
                    {product.image_urls && product.image_urls.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {product.image_urls.slice(0, 3).map((imageUrl, index) => (
                          <div key={index} className="w-12 h-12 rounded border overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                console.error('ProductManagement - Image failed to load:', target.src);
                                target.src = '/placeholder.svg';
                              }}
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                console.log('ProductManagement - Image loaded:', target.src);
                              }}
                            />
                          </div>
                        ))}
                        {product.image_urls.length > 3 && (
                          <div className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                            +{product.image_urls.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {(product.stock || 0) <= product.reorder_point && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low Stock
                    </Badge>
                  )}
                  
                  <Badge 
                    variant={product.is_active ? "default" : "secondary"}
                    className={product.is_active ? "bg-green-100 text-green-700" : ""}
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>

                  {product.is_featured && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Featured
                    </Badge>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                    >
                      {product.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => initiateDeleteProduct(product)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deletionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No products match your search criteria.' : 'Get started by adding your first product.'}
            </p>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      )}

      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onProductAdded={fetchProducts}
      />

      <EditProductDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={selectedProduct}
        onProductUpdated={fetchProducts}
      />

      <BulkUploadDialog
        open={showBulkUploadDialog}
        onOpenChange={setShowBulkUploadDialog}
        onUploadComplete={fetchProducts}
      />

      <ProductDeletionDialog
        open={showDeletionDialog}
        onOpenChange={setShowDeletionDialog}
        productName={productToDelete?.name || ''}
        deletionCheck={deletionCheck}
        onConfirmDelete={handleConfirmDelete}
        onForceDelete={handleForceDelete}
        onSoftDelete={handleSoftDelete}
        loading={deletionLoading}
      />
    </div>
  );
};

export default ProductManagement;
