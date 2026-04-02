import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Eye } from 'lucide-react';
import type { Record as RecordType, UserRole } from '../../types';

interface RecordTableProps {
  records: RecordType[];
  userRole: UserRole;
  currentUserId?: number;
  onEdit?: (record: RecordType) => void;
  onDelete?: (id: number) => void;
  onView?: (record: RecordType) => void;
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function RecordTable({
  records,
  userRole,
  currentUserId,
  onEdit,
  onDelete,
  onView,
}: RecordTableProps) {
  const canEdit = (record: RecordType) =>
    userRole === 'admin' || (userRole === 'viewer' && record.userId === currentUserId);

  const canDelete = (record: RecordType) =>
    userRole === 'admin' || (userRole === 'viewer' && record.userId === currentUserId);

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {(userRole === 'admin' || userRole === 'analyst'
                ? ['User', 'Notes', 'Category', 'Type', 'Amount', 'Date', 'Actions']
                : ['Notes', 'Category', 'Type', 'Amount', 'Date', 'Actions']
              ).map((header) => (
                <th
                  key={header}
                  className="px-5 py-4 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {records.map((record, index) => (
                <motion.tr
                  key={record.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200 group"
                >
                  {(userRole === 'admin' || userRole === 'analyst') && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg gradient-purple-blue flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {record.userName?.charAt(0) || 'U'}
                        </div>
                        <p className="text-sm font-medium text-white">{record.userName || 'Unknown User'}</p>
                      </div>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <p className="text-sm text-navy-300">{record.notes || '—'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-navy-700/50 text-xs font-medium text-navy-300">
                      {record.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        record.type === 'income'
                          ? 'bg-accent-emerald/10 text-accent-emerald'
                          : 'bg-accent-rose/10 text-accent-rose'
                      }`}
                    >
                      {record.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        record.type === 'income' ? 'text-accent-emerald' : 'text-accent-rose'
                      }`}
                    >
                      {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-navy-300">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onView?.(record)}
                        className="p-1.5 rounded-lg hover:bg-accent-blue/10 text-navy-400 hover:text-accent-blue transition-colors duration-200"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      {canEdit(record) && (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onEdit?.(record)}
                          className="p-1.5 rounded-lg hover:bg-accent-purple/10 text-navy-400 hover:text-accent-purple transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                      )}
                      {canDelete(record) && (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete?.(record.id)}
                          className="p-1.5 rounded-lg hover:bg-accent-rose/10 text-navy-400 hover:text-accent-rose transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-navy-400">
          <p className="text-lg font-medium">No records found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
