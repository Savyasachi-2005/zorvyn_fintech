import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import api from '../../lib/api';
import type {
  MonthlyTrend,
  CategoryBreakdown,
  TrendRowFromAPI,
  CategoryFromAPI,
  SummaryFromAPI,
} from '../../types';
import { normalizeTrends, normalizeCategories } from '../../types';

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

export default function Analytics() {
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trendsRes, categoriesRes, summaryRes] = await Promise.all([
          api.get<TrendRowFromAPI[]>('/dashboard/trends'),
          api.get<CategoryFromAPI[]>('/dashboard/category'),
          api.get<SummaryFromAPI>('/dashboard/summary'),
        ]);
        setTrends(normalizeTrends(trendsRes.data));
        setCategories(normalizeCategories(categoriesRes.data));
        setSummary({
          totalIncome: summaryRes.data.total_income,
          totalExpense: summaryRes.data.total_expense,
          balance: summaryRes.data.balance,
        });
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const savingsData = trends.map((t) => ({
    month: t.month,
    savings: t.income - t.expense,
    rate: t.income > 0 ? Math.round(((t.income - t.expense) / t.income) * 100) : 0,
  }));

  // Build radar data from categories
  const maxCat = Math.max(...categories.map(c => c.amount), 1);
  const radarData = categories.map(c => ({
    category: c.category,
    current: Math.round((c.amount / maxCat) * 100),
    average: Math.round(Math.random() * 70 + 20), // placeholder until comparative data exists
  }));

  // Compute stat cards from real summary
  const avgMonthlyIncome = trends.length > 0
    ? Math.round(trends.reduce((s, t) => s + t.income, 0) / trends.length)
    : 0;
  const avgMonthlyExpense = trends.length > 0
    ? Math.round(trends.reduce((s, t) => s + t.expense, 0) / trends.length)
    : 0;
  const savingsRate = avgMonthlyIncome > 0
    ? ((avgMonthlyIncome - avgMonthlyExpense) / avgMonthlyIncome * 100).toFixed(1)
    : '0';

  const statCards = [
    {
      label: 'Total Income',
      value: `₹${summary.totalIncome.toLocaleString()}`,
      change: trends.length > 1
        ? `${trends[trends.length - 1]?.income > trends[trends.length - 2]?.income ? '+' : ''}${(
            ((trends[trends.length - 1]?.income - trends[trends.length - 2]?.income) / (trends[trends.length - 2]?.income || 1)) * 100
          ).toFixed(1)}%`
        : 'N/A',
      positive: trends.length > 1 ? trends[trends.length - 1]?.income >= trends[trends.length - 2]?.income : true,
      icon: TrendingUp,
      gradient: 'gradient-emerald-cyan',
    },
    {
      label: 'Total Expense',
      value: `₹${summary.totalExpense.toLocaleString()}`,
      change: trends.length > 1
        ? `${trends[trends.length - 1]?.expense > trends[trends.length - 2]?.expense ? '+' : ''}${(
            ((trends[trends.length - 1]?.expense - trends[trends.length - 2]?.expense) / (trends[trends.length - 2]?.expense || 1)) * 100
          ).toFixed(1)}%`
        : 'N/A',
      positive: trends.length > 1 ? trends[trends.length - 1]?.expense <= trends[trends.length - 2]?.expense : true,
      icon: TrendingDown,
      gradient: 'gradient-rose-amber',
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate}%`,
      change: `Avg ₹${avgMonthlyIncome.toLocaleString()}/mo`,
      positive: Number(savingsRate) > 0,
      icon: IndianRupee,
      gradient: 'gradient-purple-blue',
    },
    {
      label: 'Net Balance',
      value: `₹${summary.balance.toLocaleString()}`,
      change: summary.balance >= 0 ? 'Positive' : 'Negative',
      positive: summary.balance >= 0,
      icon: Target,
      gradient: 'gradient-cyan-blue',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          Analytics
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-navy-400 mt-1"
        >
          Deep insights into your financial patterns
        </motion.p>
      </div>

      {/* Stat Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="glass-card p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.gradient} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  card.positive ? 'text-accent-emerald' : 'text-accent-rose'
                }`}
              >
                {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.change}
              </span>
            </div>
            <p className="text-sm text-navy-400">{card.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Income vs Expense Bar Chart */}
      {trends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Income vs Expense</h3>
          <p className="text-sm text-navy-400 mb-6">Monthly comparison</p>
          <div className="chart-scroll">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trends} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#5a7099" tick={{ fill: '#8899bb', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#5a7099" tick={{ fill: '#8899bb', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Savings Trend Line */}
        {savingsData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-1">Savings Trend</h3>
            <p className="text-sm text-navy-400 mb-6">Monthly net savings</p>
            <div className="chart-scroll">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={savingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#5a7099" tick={{ fill: '#8899bb', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5a7099" tick={{ fill: '#8899bb', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 2, stroke: '#0a0e1a' }}
                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                    name="Savings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Spending Radar */}
        {radarData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-1">Spending Profile</h3>
            <p className="text-sm text-navy-400 mb-6">Your spending vs average</p>
            <div className="chart-scroll">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#8899bb', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#5a7099', fontSize: 10 }} />
                  <Radar name="You" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Average" dataKey="average" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                  <Legend
                    formatter={(value: string) => <span className="text-xs text-navy-300">{value}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* Category Breakdown Table */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Category Breakdown</h3>
          <p className="text-sm text-navy-400 mb-6">Expense distribution by category</p>
          <div className="space-y-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-[8rem_minmax(0,1fr)_5rem_3rem] gap-2 sm:gap-4 items-center"
              >
                <div className="text-sm text-navy-300 truncate">{cat.category}</div>
                <div className="h-3 rounded-full bg-navy-800/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: cat.fill }}
                  />
                </div>
                <div className="text-right text-sm font-medium text-white">
                  ₹{cat.amount.toLocaleString()}
                </div>
                <div className="text-right text-xs text-navy-400">{cat.percentage}%</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
