
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  CheckCircle 
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: any[];
  lowStockProducts: any[];
  topProducts: any[];
}

const AdminDashboard = () => {
  const { logAdminActivity } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [],
    lowStockProducts: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch orders and calculate revenue
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, created_at, status');
        
        const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        const totalOrders = orders?.length || 0;

        // Fetch customers count
        const { count: customersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch products
        const { data: products } = await supabase
          .from('products')
          .select('*');
        
        const totalProducts = products?.length || 0;
        const lowStockProducts = products?.filter(p => (p.stock || 0) <= (p.reorder_point || 10)) || [];

        // Fetch recent orders
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('*, profiles!inner(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalRevenue,
          totalOrders,
          totalCustomers: customersCount || 0,
          totalProducts,
          recentOrders: recentOrders || [],
          lowStockProducts,
          topProducts: products?.slice(0, 5) || [],
        });

        await logAdminActivity('view', 'dashboard');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [logAdminActivity]);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your BIOSAP admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockProducts.length > 0 && (
                <span className="text-orange-600">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                  {stats.lowStockProducts.length} low stock
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {order.profiles?.first_name} {order.profiles?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${Number(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={order.status === 'completed' ? 'default' : 'secondary'}
                      className={order.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                    >
                      {order.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {product.stock || 0} left
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Reorder at {product.reorder_point || 10}
                    </p>
                  </div>
                </div>
              ))}
              {stats.lowStockProducts.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">All products in stock!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
