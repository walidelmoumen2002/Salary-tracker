

import React, { useMemo } from 'react';
// Fix: Removed non-existent 'CATEGORIES' import.
import { Expense, Category } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, XAxis, YAxis, Bar } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface ExpenseChartsProps {
  expenses: Expense[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses }) => {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#A1A1AA' : '#71717A'; // zinc-400 and zinc-500
  const tooltipBackgroundColor = theme === 'dark' ? '#09090B' : '#FFFFFF'; // zinc-950 and white
  const tooltipBorderColor = theme === 'dark' ? '#27272A' : '#E4E4E7'; // zinc-800 and zinc-200

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
        const month = expense.date.substring(0, 7); // YYYY-MM
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

  if (expenses.length === 0) {
    return null; // Don't render charts if there's no data
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-center">Expenses by Category</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dataByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {dataByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                    backgroundColor: tooltipBackgroundColor,
                    borderColor: tooltipBorderColor,
                    borderRadius: '0.5rem'
                }}
              />
              <Legend wrapperStyle={{ color: tickColor }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
       <div>
        <h3 className="text-xl font-semibold mb-4 text-center">Monthly Expense Trend</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={dataByMonth}>
              <XAxis dataKey="name" stroke={tickColor}/>
              <YAxis stroke={tickColor}/>
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                    backgroundColor: tooltipBackgroundColor,
                    borderColor: tooltipBorderColor,
                    borderRadius: '0.5rem'
                }}
                cursor={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
