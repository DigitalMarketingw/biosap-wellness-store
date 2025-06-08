
import React from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { MetricCard } from '@/components/analytics/MetricCard';
import { SalesChart } from '@/components/analytics/SalesChart';
import { CategoryChart } from '@/components/analytics/CategoryChart';
import { TopProductsTable } from '@/components/analytics/TopProductsTable';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

const Analytics = () => {
  const { overview, salesData, categoryPerformance, topProducts, isLoading } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Business insights and performance metrics</p>
      </div>

      {/* Overview Metrics */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={overview.totalRevenue}
            change={overview.revenueGrowth}
            icon={<DollarSign className="h-4 w-4" />}
            format="currency"
          />
          <MetricCard
            title="Total Orders"
            value={overview.totalOrders}
            change={overview.orderGrowth}
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <MetricCard
            title="Products"
            value={overview.totalProducts}
            icon={<Package className="h-4 w-4" />}
          />
          <MetricCard
            title="Customers"
            value={overview.totalCustomers}
            icon={<Users className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {salesData && <SalesChart data={salesData} />}
        {categoryPerformance && <CategoryChart data={categoryPerformance} />}
      </div>

      {/* Top Products Table */}
      {topProducts && <TopProductsTable data={topProducts} />}
    </div>
  );
};

export default Analytics;
