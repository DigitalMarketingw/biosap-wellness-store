
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Upload, Download, AlertCircle } from 'lucide-react';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
}) => {
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { logAdminActivity } = useAdmin();

  const sampleCSV = `name,description,price,stock,sku,category_id,subcategory_id,is_featured,ingredients,usage_instructions,benefits
"Ashwagandha Capsules","Premium Ashwagandha supplement",29.99,100,"ASH001","","",false,"Ashwagandha extract","Take 1 capsule daily","Stress relief|Energy boost"
"Turmeric Powder","Organic turmeric powder",15.99,50,"TUR001","","",true,"Organic turmeric","Mix with warm milk","Anti-inflammatory|Immunity support"`;

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const product: any = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.replace(/^"|"$/g, ''); // Remove surrounding quotes
        
        switch (header) {
          case 'price':
            product[header] = parseFloat(value) || 0;
            break;
          case 'stock':
          case 'reorder_point':
          case 'reorder_quantity':
            product[header] = parseInt(value) || 0;
            break;
          case 'is_featured':
          case 'is_active':
            product[header] = value.toLowerCase() === 'true';
            break;
          case 'benefits':
            product[header] = value ? value.split('|').map(b => b.trim()) : null;
            break;
          case 'category_id':
          case 'subcategory_id':
            product[header] = value || null;
            break;
          default:
            product[header] = value || null;
        }
      });
      
      products.push(product);
    }
    
    return products;
  };

  const validateProduct = (product: any, index: number) => {
    const errors = [];
    
    if (!product.name) {
      errors.push(`Row ${index + 2}: Product name is required`);
    }
    
    if (!product.price || product.price <= 0) {
      errors.push(`Row ${index + 2}: Valid price is required`);
    }
    
    return errors;
  };

  const handleUpload = async () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const products = parseCSV(csvData);
      const validationErrors: string[] = [];
      
      // Validate all products
      products.forEach((product, index) => {
        const productErrors = validateProduct(product, index);
        validationErrors.push(...productErrors);
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Insert products
      const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();

      if (error) throw error;

      await logAdminActivity('create', 'products', undefined, { 
        bulk_upload: true, 
        count: products.length 
      });

      toast({
        title: "Success",
        description: `Successfully uploaded ${products.length} products`,
      });

      setCsvData('');
      onUploadComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error uploading products:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Products</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload products using CSV format</li>
              <li>• Download the template to see the required format</li>
              <li>• Required fields: name, price</li>
              <li>• Use pipe (|) to separate multiple benefits</li>
              <li>• Leave category_id and subcategory_id empty or provide valid UUIDs</li>
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={downloadSample}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              CSV Data (paste your CSV content here):
            </label>
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <h3 className="font-medium text-red-900">Validation Errors:</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Products
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;
