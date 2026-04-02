import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import RecordTable from '../../components/dashboard/RecordTable';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { Record, RecordFilters, RecordType, PaginatedResponse, RecordFromAPI } from '../../types';
import { normalizeRecord } from '../../types';

const CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Other'];

export default function Records() {
  const { user, hasRole } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 8;

  const [filters, setFilters] = useState<RecordFilters>({
    search: '',
    category: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  // New record form — matches backend RecordCreate schema
  const [newRecord, setNewRecord] = useState({
    amount: '',
    type: 'income' as RecordType,
    category: 'Salary',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: { [key: string]: string | number } = {
        page,
        limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.date_from = filters.startDate;
      if (filters.endDate) params.date_to = filters.endDate;

      const { data } = await api.get<PaginatedResponse<RecordFromAPI>>('/records', { params });
      setRecords(data.items.map(normalizeRecord));
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.category, filters.type, filters.startDate, filters.endDate]);

  const totalPages = Math.ceil(total / limit);

  const openModal = (mode: 'create' | 'edit' | 'view', record?: Record) => {
    setModalMode(mode);
    if (record) {
      setSelectedRecordId(record.id);
      setNewRecord({
        amount: record.amount.toString(),
        type: record.type,
        category: record.category,
        date: record.date.split('T')[0],
        notes: record.notes || '',
      });
    } else {
      setSelectedRecordId(null);
      setNewRecord({ amount: '', type: 'income', category: 'Salary', date: new Date().toISOString().split('T')[0], notes: '' });
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedRecordId(null);
    setNewRecord({ amount: '', type: 'income', category: 'Salary', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'view') return;
    setSaving(true);
    const isEdit = modalMode === 'edit' && selectedRecordId;
    const toastId = toast.loading(isEdit ? 'Saving changes...' : 'Creating record...');
    try {
      const payload = {
        amount: Number(newRecord.amount),
        type: newRecord.type,
        category: newRecord.category,
        date: newRecord.date,
        notes: newRecord.notes || null,
      };
      if (isEdit) {
        await api.put(`/records/${selectedRecordId}`, payload);
      } else {
        await api.post('/records', payload);
      }
      toast.success(isEdit ? 'Record updated' : 'Record created', { id: toastId });
      closeModal();
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save record', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const toastId = toast.loading('Deleting record...');
    try {
      await api.delete(`/records/${id}`);
      toast.success('Record deleted', { id: toastId });
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete record', { id: toastId });
    }
  };

  const canCreate = hasRole(['viewer', 'admin']);
  const activeFiltersCount = [filters.category, filters.type, filters.startDate, filters.endDate].filter(Boolean).length;

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
            Records
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-navy-400 mt-1"
          >
            {total} total records
          </motion.p>
        </div>
        {canCreate && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openModal('create')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-purple-blue text-white font-medium text-sm shadow-lg hover:shadow-xl hover:shadow-accent-purple/20 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </motion.button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            id="records-search"
            type="text"
            placeholder="Search records..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all duration-200"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
            showFilters || activeFiltersCount > 0
              ? 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple'
              : 'bg-navy-800/50 border-white/[0.06] text-navy-300 hover:text-white hover:border-accent-purple/30'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full gradient-purple-blue text-xs flex items-center justify-center text-white">
              {activeFiltersCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-navy-400 mb-1.5">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-400 mb-1.5">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as RecordType | '' }))}
                    className="w-full px-3 py-2 rounded-lg bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                  >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-400 mb-1.5">From</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-400 mb-1.5">To</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                  />
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setFilters({ search: filters.search, category: '', type: '', startDate: '', endDate: '' })}
                  className="mt-4 flex items-center gap-1 text-xs text-accent-rose hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div className="glass-card p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
        </div>
      ) : (
        <RecordTable
          records={records}
          userRole={user?.role || 'viewer'}
          currentUserId={user?.id}
          onDelete={handleDelete}
          onEdit={(r) => openModal('edit', r)}
          onView={(r) => openModal('view', r)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-navy-400">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-navy-800/50 border border-white/[0.06] text-navy-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                  p === page
                    ? 'gradient-purple-blue text-white shadow-lg'
                    : 'bg-navy-800/50 border border-white/[0.06] text-navy-300 hover:text-white'
                }`}
              >
                {p}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-navy-800/50 border border-white/[0.06] text-navy-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Create/Edit/View Modal */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {modalMode === 'create' ? 'New Record' : modalMode === 'edit' ? 'Edit Record' : 'Record Details'}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-navy-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1.5">Amount</label>
                    <input
                      type="number"
                      value={newRecord.amount}
                      onChange={(e) => setNewRecord((r) => ({ ...r, amount: e.target.value }))}
                      required
                      min="0.01"
                      step="0.01"
                      disabled={modalMode === 'view'}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1.5">Type</label>
                    <select
                      value={newRecord.type}
                      onChange={(e) => setNewRecord((r) => ({ ...r, type: e.target.value as RecordType }))}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all disabled:opacity-50"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1.5">Category</label>
                    <select
                      value={newRecord.category}
                      onChange={(e) => setNewRecord((r) => ({ ...r, category: e.target.value }))}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all disabled:opacity-50"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-300 mb-1.5">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                      <input
                        type="date"
                        value={newRecord.date}
                        onChange={(e) => setNewRecord((r) => ({ ...r, date: e.target.value }))}
                        disabled={modalMode === 'view'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-300 mb-1.5">Notes (optional)</label>
                  <input
                    type="text"
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord((r) => ({ ...r, notes: e.target.value }))}
                    disabled={modalMode === 'view'}
                    placeholder="e.g. Monthly salary payment"
                    className="w-full px-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm font-medium text-navy-300 hover:text-white transition-all"
                  >
                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                  </motion.button>
                  {modalMode !== 'view' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl gradient-purple-blue text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-accent-purple/20 transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="w-5 h-5 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : modalMode === 'edit' ? (
                        'Save Changes'
                      ) : (
                        'Create Record'
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
