
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

interface UploadResult {
  success: boolean;
  inserted_count: number;
  updated_count: number;
  error_count: number;
  errors: Array<{ row: any; error: string }>;
}

const BulkUploadDialog = ({ open, onOpenChange, onUploadComplete }: BulkUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const { adminUser } = useAdmin();

  const csvTemplate = `name,description,price,stock,sku,category_name,supplier_name,reorder_point,reorder_quantity,is_active,is_featured,image_urls,ingredients,usage_instructions,benefits
"Ashwagandha Capsules","Premium quality Ashwagandha for stress relief",25.99,100,"ASH-001","supplements","Herbal Suppliers Ltd",10,50,true,false,"https://example.com/image1.jpg","Ashwagandha root extract 500mg","Take 1-2 capsules daily with meals","Stress relief;Improved energy;Better sleep"
"Turmeric Powder","Organic turmeric powder for cooking and health",12.50,200,"TUR-001","spices","Organic Farms Co",20,100,true,true,"https://example.com/image2.jpg;https://example.com/image3.jpg","100% organic turmeric","Use 1 tsp in cooking or mix with warm milk","Anti-inflammatory;Antioxidant;Digestive support"`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    return lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
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
        const value = values[index]?.replace(/"/g, '') || '';
        product[header] = value;
      });
      
      return product;
    });
  };

  const handleFileUpload = async () => {
    if (!file || !adminUser) {
      toast({
        title: "Error",
        description: "Please select a file and ensure you're logged in as admin",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const text = await file.text();
      setUploadProgress(25);
      
      const products = parseCSV(text);
      setUploadProgress(50);
      
      if (products.length === 0) {
        throw new Error('No valid products found in CSV');
      }

      // Validate required fields
      const requiredFields = ['name', 'price', 'stock'];
      for (const product of products) {
        for (const field of requiredFields) {
          if (!product[field]) {
            throw new Error(`Missing required field "${field}" in one or more rows`);
          }
        }
      }

      setUploadProgress(75);

      const { data, error } = await supabase.rpc('bulk_insert_products', {
        products_data: products,
        admin_user_id: adminUser.id
      });

      if (error) throw error;

      setUploadProgress(100);
      setUploadResult(data);

      if (data.error_count === 0) {
        toast({
          title: "Success",
          description: `Successfully processed ${data.inserted_count + data.updated_count} products`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Processed ${data.inserted_count + data.updated_count} products with ${data.error_count} errors`,
          variant: "destructive",
        });
      }

      onUploadComplete();
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload products",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        resetDialog();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Product Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-2">CSV Template</h3>
                  <p className="text-sm text-gray-600">
                    Download the template to see the required format and example data
                  </p>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Upload CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                    className="mt-1"
                  />
                </div>

                {file && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}

                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-600">Processing... {uploadProgress}%</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleFileUpload} 
                    disabled={!file || uploading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {uploading ? 'Uploading...' : 'Upload Products'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {uploadResult && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Upload Results</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">{uploadResult.inserted_count}</span>
                    </div>
                    <p className="text-sm text-gray-600">New Products</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">{uploadResult.updated_count}</span>
                    </div>
                    <p className="text-sm text-gray-600">Updated Products</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">{uploadResult.error_count}</span>
                    </div>
                    <p className="text-sm text-gray-600">Errors</p>
                  </div>
                </div>

                {uploadResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Errors:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <p className="text-red-700 font-medium">Row {index + 2}: {error.error}</p>
                          <p className="text-red-600">Product: {error.row.name || 'Unknown'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">CSV Format Instructions</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Required fields:</strong> name, price, stock</p>
                <p><strong>Optional fields:</strong> description, sku, category_name, supplier_name, etc.</p>
                <p><strong>Array fields:</strong> Separate multiple values with semicolons (;)</p>
                <p><strong>Example:</strong> image_urls: "url1.jpg;url2.jpg;url3.jpg"</p>
                <p><strong>Boolean fields:</strong> Use "true" or "false" for is_active and is_featured</p>
                <p><strong>Updates:</strong> Products with existing SKUs will be updated</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;
