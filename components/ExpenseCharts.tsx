
import React, { useMemo, useState, useEffect } from 'react';
import { Expense, Category } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, XAxis, YAxis, Bar } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ExpenseChartsProps {
  expenses: Expense[];
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
];

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses }) => {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#A1A1AA' : '#71717A';
  const tooltipBackgroundColor = theme === 'dark' ? '#18181B' : '#FFFFFF';
  const tooltipBorderColor = theme === 'dark' ? '#27272A' : '#E4E4E7';

  // Delay chart render to avoid width/height -1 warnings
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const dataByCategory = useMemo(() => {
    const categoryMap: { [key in Category]?: number } = {};

    expenses.forEach(expense => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category]! += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const dataByMonth = useMemo(() => {
    const monthMap: { [key: string]: number } = {};
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedExpenses.forEach(expense => {
        const month = expense.date.substring(0, 7);
        if (monthMap[month]) {
            monthMap[month] += expense.amount;
        } else {
            monthMap[month] = expense.amount;
        }
    });

    return Object.entries(monthMap).map(([month, total]) => ({
        name: new Date(`${month}-01T12:00:00`).toLocaleString('default', { month: 'short' }),
        total,
    }));
  }, [expenses]);

  if (expenses.length === 0 || !isReady) {
    return null;
  }

  // Custom tooltip formatter
  const customTooltipFormatter = (value: number) => formatCurrency(value);

  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold text-center">
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="w-full h-[250px] sm:h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={dataByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="70%"
                  innerRadius="40%"
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                >
                  {dataByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={customTooltipFormatter}
                  contentStyle={{
                      backgroundColor: tooltipBackgroundColor,
                      borderColor: tooltipBorderColor,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      padding: '8px 12px'
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: tickColor,
                    fontSize: '0.75rem'
                  }}
                  layout="horizontal"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold text-center">
            Monthly Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="w-full h-[250px] sm:h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={dataByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke={tickColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={tickColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={customTooltipFormatter}
                  contentStyle={{
                      backgroundColor: tooltipBackgroundColor,
                      borderColor: tooltipBorderColor,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      padding: '8px 12px'
                  }}
                  cursor={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar
                  dataKey="total"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
