import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { MonthlyTrend, CategoryBreakdown } from '../../types';

interface ChartsProps {
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 !rounded-lg">
      <p className="text-sm font-medium text-white mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: ₹{entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Charts({ monthlyTrends, categoryBreakdown }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Monthly Trends - Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="lg:col-span-2 glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-1">Monthly Trends</h3>
        <p className="text-sm text-navy-400 mb-6">Income vs Expense over time</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyTrends}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              stroke="#5a7099"
              tick={{ fill: '#8899bb', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#5a7099"
              tick={{ fill: '#8899bb', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#incomeGrad)"
              name="Income"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#expenseGrad)"
              name="Expense"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category Breakdown - Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-1">Categories</h3>
        <p className="text-sm text-navy-400 mb-6">Spending distribution</p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryBreakdown}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="amount"
              nameKey="category"
              stroke="none"
            >
              {categoryBreakdown.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-navy-300">{value}</span>
              )}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="glass-card p-3 !rounded-lg">
                    <p className="text-sm font-medium text-white">{d.category}</p>
                    <p className="text-xs text-navy-300">
                      ₹{d.amount.toLocaleString()} ({d.percentage}%)
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
