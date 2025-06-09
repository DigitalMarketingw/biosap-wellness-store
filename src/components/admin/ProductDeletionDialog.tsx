
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trash2, Archive } from 'lucide-react';
import { ProductDeletionCheck } from '@/utils/productDeletion';

interface ProductDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  deletionCheck: ProductDeletionCheck | null;
  onConfirmDelete: () => void;
  onForceDelete: () => void;
  onSoftDelete: () => void;
  loading: boolean;
}

const ProductDeletionDialog = ({
  open,
  onOpenChange,
  productName,
  deletionCheck,
  onConfirmDelete,
  onForceDelete,
  onSoftDelete,
  loading
}: ProductDeletionDialogProps) => {
  if (!deletionCheck) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete <strong>"{productName}"</strong>?
              </p>
              
              {deletionCheck.canDelete ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    ✅ This product can be safely deleted as it has no references.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-700 font-medium mb-2">
                      ⚠️ Cannot delete: This product is referenced by:
                    </p>
                    <div className="space-y-1">
                      {deletionCheck.references.map((ref, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {ref.description}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Options:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li><strong>Deactivate:</strong> Hide product but keep data intact</li>
                      <li><strong>Force Delete:</strong> Remove cart/wishlist references (keeps order history)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          
          {deletionCheck.canDelete ? (
            <Button 
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Product
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={onSoftDelete}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Deactivate
              </Button>
              
              <Button 
                variant="destructive"
                onClick={onForceDelete}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Force Delete
              </Button>
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProductDeletionDialog;
