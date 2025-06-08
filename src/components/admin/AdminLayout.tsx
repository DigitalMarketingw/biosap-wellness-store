import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  BarChart3,
  Truck,
  Tag,
  Building2,
  Activity,
  LogOut,
  Leaf
} from 'lucide-react';

const AdminLayout = () => {
  const { adminUser, isAdmin } = useAdmin();
  const location = useLocation();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Inventory', href: '/admin/inventory', icon: Truck },
    { name: 'Suppliers', href: '/admin/suppliers', icon: Building2 },
    { name: 'Promotions', href: '/admin/promotions', icon: Tag },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Activity Logs', href: '/admin/logs', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const hasAccess = (route: string) => {
    const role = adminUser?.admin_role;
    if (role === 'super_admin') return true;
    
    const rolePermissions: Record<string, string[]> = {
      admin: ['dashboard', 'products', 'categories', 'orders', 'customers', 'inventory', 'suppliers', 'promotions', 'analytics', 'logs'],
      category_manager: ['dashboard', 'products', 'categories', 'inventory'],
      order_manager: ['dashboard', 'orders', 'customers', 'inventory'],
      inventory_manager: ['dashboard', 'products', 'inventory', 'suppliers'],
    };
    
    const routeName = route.split('/').pop() || 'dashboard';
    return rolePermissions[role]?.includes(routeName) || false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center px-6 border-b">
          <img 
            src="/lovable-uploads/2902c1b1-4f02-4a7c-8ea6-1f48a7664697.png" 
            alt="BIOSAP Logo" 
            className="h-8 w-auto"
          />
          <h1 className="ml-2 text-xl font-bold text-green-800">Admin</h1>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <p className="text-sm text-gray-600">Logged in as</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {adminUser?.admin_role?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const hasRouteAccess = hasAccess(item.href);
              
              if (!hasRouteAccess) return null;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-8 pt-4 border-t">
            <Link to="/" className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              <LogOut className="mr-3 h-5 w-5" />
              Back to Store
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
