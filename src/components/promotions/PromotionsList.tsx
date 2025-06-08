
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, Users, Target } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Promotion } from '@/hooks/usePromotions';

interface PromotionsListProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const PromotionsList = ({
  promotions,
  onEdit,
  onDelete,
  isDeleting = false,
}: PromotionsListProps) => {
  const [deletePromotionId, setDeletePromotionId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatValue = (type: string, value: number) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    return `$${value.toFixed(2)}`;
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    if (!promotion.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return <Badge variant="default" className="bg-green-600">Active</Badge>;
  };

  const handleDeleteConfirm = () => {
    if (deletePromotionId) {
      onDelete(deletePromotionId);
      setDeletePromotionId(null);
    }
  };

  if (promotions.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions found</h3>
        <p className="text-gray-600">
          Create your first promotion to start offering discounts to customers.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{promotion.name}</div>
                    {promotion.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {promotion.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {promotion.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatValue(promotion.type, promotion.value)}
                </TableCell>
                <TableCell>
                  {promotion.code ? (
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {promotion.code}
                    </code>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-3 w-3" />
                    <span>
                      {promotion.usage_count}
                      {promotion.usage_limit ? ` / ${promotion.usage_limit}` : ''}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(promotion)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(promotion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletePromotionId(promotion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog 
        open={!!deletePromotionId} 
        onOpenChange={() => setDeletePromotionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this promotion? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
