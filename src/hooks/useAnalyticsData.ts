
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoryPerformance {
  name: string;
  revenue: number;
  orders: number;
  products: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  revenue: number;
  quantity_sold: number;
  stock: number;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export const useAnalyticsData = () => {
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async (): Promise<AnalyticsOverview> => {
      console.log('Fetching analytics overview...');
      
      // Get current month data
      const currentStart = startOfMonth(currentMonth);
      const currentEnd = endOfMonth(currentMonth);
      
      // Get last month data for comparison
      const lastStart = startOfMonth(lastMonth);
      const lastEnd = endOfMonth(lastMonth);

      // Current month stats
      const { data: currentOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', currentEnd.toISOString());

      // Last month stats for growth calculation
      const { data: lastOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', lastStart.toISOString())
        .lte('created_at', lastEnd.toISOString());

      // Get total stats
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount');

      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const currentRevenue = currentOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const lastRevenue = lastOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalRevenue = allOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;
      const orderGrowth = lastOrders?.length && currentOrders?.length ? 
        ((currentOrders.length - lastOrders.length) / lastOrders.length) * 100 : 0;

      return {
        totalRevenue,
        totalOrders: allOrders?.length || 0,
        totalProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
        revenueGrowth,
        orderGrowth,
      };
    },
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data'],
    queryFn: async (): Promise<SalesData[]> => {
      console.log('Fetching sales data...');
      
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .order('created_at');

      if (!orders) return [];

      // Group by date and calculate daily totals
      const dailyData = orders.reduce((acc, order) => {
        const date = format(new Date(order.created_at), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = { revenue: 0, orders: 0 };
        }
        acc[date].revenue += Number(order.total_amount);
        acc[date].orders += 1;
        return acc;
      }, {} as Record<string, { revenue: number; orders: number }>);

      return Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .slice(-30); // Last 30 days
    },
  });

  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery({
    queryKey: ['category-performance'],
    queryFn: async (): Promise<CategoryPerformance[]> => {
      console.log('Fetching category performance...');
      
      const { data: categories } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          products!inner(
            id,
            price,
            order_items(
              quantity,
              price
            )
          )
        `);

      if (!categories) return [];

      return categories.map(category => {
        const products = category.products || [];
        let totalRevenue = 0;
        let totalOrders = 0;

        products.forEach(product => {
          if (product.order_items) {
            product.order_items.forEach(item => {
              totalRevenue += Number(item.price) * item.quantity;
              totalOrders += item.quantity;
            });
          }
        });

        return {
          name: category.name,
          revenue: totalRevenue,
          orders: totalOrders,
          products: products.length,
        };
      });
    },
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['top-products'],
    queryFn: async (): Promise<ProductPerformance[]> => {
      console.log('Fetching top products...');
      
      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock,
          order_items(
            quantity,
            price
          )
        `)
        .limit(10);

      if (!products) return [];

      return products
        .map(product => {
          const orderItems = product.order_items || [];
          const totalRevenue = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
          const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            id: product.id,
            name: product.name,
            revenue: totalRevenue,
            quantity_sold: totalQuantity,
            stock: product.stock || 0,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
  });

  return {
    overview,
    salesData,
    categoryPerformance,
    topProducts,
    isLoading: overviewLoading || salesLoading || categoryLoading || productsLoading,
  };
};
