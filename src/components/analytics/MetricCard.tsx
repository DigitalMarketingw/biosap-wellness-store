
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  format?: 'currency' | 'number' | 'percentage';
}

export const MetricCard = ({ title, value, change, icon, format = 'number' }: MetricCardProps) => {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(numVal);
      case 'percentage':
        return `${numVal.toFixed(1)}%`;
      default:
        return numVal.toLocaleString();
    }
  };

  const formatChange = (changeVal: number) => {
    const isPositive = changeVal >= 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(changeVal).toFixed(1)}%
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="mt-1">
            {formatChange(change)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
