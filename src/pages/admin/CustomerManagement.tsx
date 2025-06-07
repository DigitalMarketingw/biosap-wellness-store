import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Users, Search, Eye, UserCheck, UserX } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  order_count?: number;
  total_spent?: number;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { logAdminActivity } = useAdmin();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // First, fetch all customers (non-admin profiles)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then, fetch order statistics for each customer
      const customersWithStats = await Promise.all(
        profilesData?.map(async (customer) => {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('id, total_amount')
            .eq('user_id', customer.id);

          if (ordersError) {
            console.error('Error fetching orders for customer:', customer.id, ordersError);
            return {
              ...customer,
              order_count: 0,
              total_spent: 0
            };
          }

          return {
            ...customer,
            order_count: ordersData?.length || 0,
            total_spent: ordersData?.reduce((sum: number, order: any) => 
              sum + Number(order.total_amount), 0) || 0
          };
        }) || []
      );

      setCustomers(customersWithStats);
      await logAdminActivity('view', 'customers');
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.first_name && customer.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.last_name && customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCustomerDisplayName = (customer: Customer) => {
    if (customer.first_name && customer.last_name) {
      return `${customer.first_name} ${customer.last_name}`;
    }
    return customer.email;
  };

  const getCustomerStatus = (customer: Customer) => {
    if (customer.last_sign_in_at) {
      const lastSignIn = new Date(customer.last_sign_in_at);
      const daysSinceLastSignIn = Math.floor((Date.now() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastSignIn <= 7) return { status: 'Active', color: 'bg-green-100 text-green-700' };
      if (daysSinceLastSignIn <= 30) return { status: 'Recent', color: 'bg-yellow-100 text-yellow-700' };
      return { status: 'Inactive', color: 'bg-red-100 text-red-700' };
    }
    return { status: 'Never Signed In', color: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return <div className="p-6">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">View and manage customer accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {customers.length} Total Customers
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customers ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
              </p>
            ) : (
              filteredCustomers.map((customer) => {
                const status = getCustomerStatus(customer);
                return (
                  <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{getCustomerDisplayName(customer)}</h3>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(customer.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Orders: {customer.order_count}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total Spent: ${customer.total_spent?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={status.color}>
                        {status.status}
                      </Badge>
                      <Badge variant="secondary">
                        {customer.role}
                      </Badge>
                      {customer.last_sign_in_at && (
                        <p className="text-xs text-gray-500">
                          Last login: {new Date(customer.last_sign_in_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;
