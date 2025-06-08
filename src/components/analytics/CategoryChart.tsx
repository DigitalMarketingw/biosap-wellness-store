
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CategoryPerformance } from '@/hooks/useAnalyticsData';

interface CategoryChartProps {
  data: CategoryPerformance[];
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(142, 71%, 45%)",
  },
};

export const CategoryChart = ({ data }: CategoryChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
