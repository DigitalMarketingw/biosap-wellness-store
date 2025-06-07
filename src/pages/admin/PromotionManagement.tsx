
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PromotionManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotion Management</h1>
          <p className="text-gray-600">Create and manage discount codes and promotions</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
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
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Promotion Management Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              This feature will allow you to create and manage discount codes, seasonal promotions, and special offers.
            </p>
            <p className="text-sm text-gray-500">
              Features will include: discount code generation, promotion scheduling, usage tracking, and performance analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionManagement;
