
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import ImageUpload from './ImageUpload';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  category_id: string;
  supplier_id: string | null;
  reorder_point: number;
  reorder_quantity: number;
  image_urls: string[];
  ingredients: string;
  usage_instructions: string;
  benefits: string[];
}

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onProductUpdated: () => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onProductUpdated
}) => {
  const { toast } = useToast();
  const { logAdminActivity } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    is_active: true,
    is_featured: false,
    category_id: '',
    supplier_id: '',
    reorder_point: '',
    reorder_quantity: '',
    image_urls: [] as string[],
    ingredients: '',
    usage_instructions: '',
    benefits: '' as string
  });

  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        sku: product.sku || '',
        is_active: product.is_active,
        is_featured: product.is_featured,
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        reorder_point: product.reorder_point.toString(),
        reorder_quantity: product.reorder_quantity.toString(),
        image_urls: product.image_urls || [],
        ingredients: product.ingredients || '',
        usage_instructions: product.usage_instructions || '',
        benefits: Array.isArray(product.benefits) ? product.benefits.join(', ') : ''
      });
    }
  }, [product, open]);

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchSuppliers();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchSuppliers();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setLoading(true);

    try {
      const benefitsArray = formData.benefits
        ? formData.benefits.split(',').map(b => b.trim()).filter(b => b)
        : [];

      const updateData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku: formData.sku || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
        reorder_point: parseInt(formData.reorder_point),
        reorder_quantity: parseInt(formData.reorder_quantity),
        image_urls: formData.image_urls,
        ingredients: formData.ingredients || null,
        usage_instructions: formData.usage_instructions || null,
        benefits: benefitsArray,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id);

      if (error) throw error;

      await logAdminActivity('update', 'products', product.id, { 
        action: 'product updated',
        changes: updateData 
      });

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      onProductUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBenefitsChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: value
    }));
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                min="0"
                value={formData.reorder_point}
                onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
              <Input
                id="reorder_quantity"
                type="number"
                min="0"
                value={formData.reorder_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, reorder_quantity: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage_instructions">Usage Instructions</Label>
            <Textarea
              id="usage_instructions"
              value={formData.usage_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, usage_instructions: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (comma-separated)</Label>
            <Input
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleBenefitsChange(e.target.value)}
              placeholder="e.g., Stress relief, Better sleep, Improved digestion"
            />
          </div>

          <div className="space-y-4">
            <Label>Product Images</Label>
            <ImageUpload
              images={formData.image_urls}
              onImagesChange={(images) => setFormData(prev => ({ ...prev, image_urls: images }))}
              maxImages={6}
            />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
