
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromotionForm } from '@/components/promotions/PromotionForm';
import { PromotionsList } from '@/components/promotions/PromotionsList';
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  Promotion,
} from '@/hooks/usePromotions';

const PromotionManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: promotions = [], isLoading, error } = usePromotions();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();

  const handleCreatePromotion = (formData: any) => {
    createPromotion.mutate({
      ...formData,
      applicable_categories: [],
      applicable_products: [],
    });
  };

  const handleUpdatePromotion = (formData: any) => {
    if (editingPromotion) {
      updatePromotion.mutate({
        id: editingPromotion.id,
        ...formData,
      });
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deletePromotion.mutate(id);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPromotion(undefined);
  };

  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (promotion.code && promotion.code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;

    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    switch (statusFilter) {
      case 'active':
        return promotion.is_active && now >= startDate && now <= endDate;
      case 'inactive':
        return !promotion.is_active;
      case 'expired':
        return now > endDate;
      case 'scheduled':
        return promotion.is_active && now < startDate;
      default:
        return true;
    }
  });

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading promotions</h3>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotion Management</h1>
          <p className="text-gray-600">Create and manage discount codes and promotions</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Promotions
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading promotions...</p>
            </div>
          ) : (
            <PromotionsList
              promotions={filteredPromotions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletePromotion.isPending}
            />
          )}
        </CardContent>
      </Card>

      <PromotionForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingPromotion ? handleUpdatePromotion : handleCreatePromotion}
        promotion={editingPromotion}
        isLoading={createPromotion.isPending || updatePromotion.isPending}
      />
    </div>
  );
};

export default PromotionManagement;
