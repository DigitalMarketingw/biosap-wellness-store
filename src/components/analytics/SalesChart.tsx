
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { SalesData } from '@/hooks/useAnalyticsData';

interface SalesChartProps {
  data: SalesData[];
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(142, 71%, 45%)",
  },
  orders: {
    label: "Orders",
    color: "hsl(142, 51%, 60%)",
  },
};

export const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--color-revenue)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-revenue)" }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              stroke="var(--color-orders)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-orders)" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
