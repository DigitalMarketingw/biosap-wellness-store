
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SupplierManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600">Manage supplier relationships and contacts</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Suppliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Supplier Management Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              This feature will allow you to manage supplier relationships, contact information, and purchase orders.
            </p>
            <p className="text-sm text-gray-500">
              Features will include: supplier profiles, contact management, purchase order tracking, and supplier performance analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierManagement;
