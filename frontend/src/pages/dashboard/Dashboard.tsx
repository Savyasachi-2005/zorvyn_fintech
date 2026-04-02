import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import SummaryCards from '../../components/dashboard/SummaryCards';
import Charts from '../../components/dashboard/Charts';
import RecordTable from '../../components/dashboard/RecordTable';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type {
  SummaryData,
  MonthlyTrend,
  CategoryBreakdown,
  Record,
  SummaryFromAPI,
  TrendRowFromAPI,
  CategoryFromAPI,
  PaginatedResponse,
  RecordFromAPI,
} from '../../types';
import {
  normalizeSummary,
  normalizeTrends,
  normalizeCategories,
  normalizeRecord,
} from '../../types';

const emptySummary: SummaryData = { totalIncome: 0, totalExpense: 0, balance: 0, recordCount: 0 };

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [summary, setSummary] = useState<SummaryData>(emptySummary);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [recentRecords, setRecentRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  const canViewAnalytics = hasRole(['analyst', 'admin']);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Records are accessible to all roles
      const recordsRes = await api.get<PaginatedResponse<RecordFromAPI>>('/records', {
        params: { limit: 5, page: 1 },
      });
      setRecentRecords(recordsRes.data.items.map(normalizeRecord));

      // Summary, trends, categories are only for analyst/admin
      if (canViewAnalytics) {
        const [summaryRes, trendsRes, categoriesRes] = await Promise.all([
          api.get<SummaryFromAPI>('/dashboard/summary'),
          api.get<TrendRowFromAPI[]>('/dashboard/trends'),
          api.get<CategoryFromAPI[]>('/dashboard/category'),
        ]);
        setSummary(normalizeSummary(summaryRes.data, recordsRes.data.total));
        setTrends(normalizeTrends(trendsRes.data));
        setCategories(normalizeCategories(categoriesRes.data));
      } else {
        // For viewers, compute summary from their own records page
        const allRes = await api.get<PaginatedResponse<RecordFromAPI>>('/records', {
          params: { limit: 100, page: 1 },
        });
        const allRecords = allRes.data.items.map(normalizeRecord);
        const totalIncome = allRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
        const totalExpense = allRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
        setSummary({
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          recordCount: allRes.data.total,
        });
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            Welcome back, <span className="text-gradient">{user?.name || user?.email || 'User'}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-navy-400 mt-1"
          >
            Here's what's happening with your finances today.
          </motion.p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-navy-300 hover:text-white hover:border-accent-purple/30 transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-navy-300">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={summary} loading={loading} />

      {/* Admin Specific Overview */}
      {user?.role === 'admin' && summary.totalUsers !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div className="glass-card p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-navy-400">Total Users</h3>
            <p className="text-3xl font-bold text-white mt-2">{summary.totalUsers}</p>
          </div>
          <div className="glass-card p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-navy-400">Active Users</h3>
            <p className="text-3xl font-bold text-accent-emerald mt-2">{summary.activeUsers}</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center justify-center border border-accent-purple/20">
            <motion.a
              href="/dashboard/users"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl gradient-purple-blue text-white font-medium shadow-lg hover:shadow-xl hover:shadow-accent-purple/20 transition-all duration-300"
            >
              <Users className="w-5 h-5" />
              Manage Users
            </motion.a>
          </div>
        </motion.div>
      )}

      {/* Charts — only for analyst/admin */}
      {canViewAnalytics && trends.length > 0 && (
        <Charts monthlyTrends={trends} categoryBreakdown={categories} />
      )}

      {/* Recent Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <p className="text-sm text-navy-400">Latest 5 records</p>
          </div>
        </div>
        <RecordTable
          records={recentRecords}
          userRole={user?.role || 'viewer'}
          currentUserId={user?.id}
        />
      </motion.div>
    </motion.div>
  );
}
