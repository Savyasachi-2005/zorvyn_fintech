import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, RefreshCw, User, FileText, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { AuditLog, AuditLogFromAPI } from '../../types';
import { normalizeAuditLog } from '../../types';

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

function ActionIcon({ action }: { action: string }) {
  const lower = action.toLowerCase();
  if (lower.includes('role') || lower.includes('activated') || lower.includes('deactivated')) {
    return <Shield className="w-4 h-4 text-accent-purple" />;
  }
  if (lower.includes('record') || lower.includes('created') || lower.includes('updated') || lower.includes('deleted')) {
    return <FileText className="w-4 h-4 text-accent-blue" />;
  }
  return <User className="w-4 h-4 text-accent-cyan" />;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<AuditLogFromAPI[]>('/admin/logs');
      setLogs(data.map(normalizeAuditLog));
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
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
            className="text-2xl font-bold text-white flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl gradient-purple-blue flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-white" />
            </div>
            Audit Logs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-navy-400 mt-1"
          >
            System activity history — {logs.length} entries
          </motion.p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-navy-300 hover:text-white hover:border-accent-purple/30 transition-all duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="glass-card p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-navy-400">
          <ScrollText className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No audit logs yet</p>
          <p className="text-sm mt-1">Actions will appear here as they happen</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Action', 'Performed By', 'Target', 'Timestamp'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {logs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      custom={index}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 20 }}
                      layout
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200"
                    >
                      {/* Action */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-navy-800/80 flex items-center justify-center flex-shrink-0">
                            <ActionIcon action={log.action} />
                          </div>
                          <span className="text-sm text-white font-medium">{log.action}</span>
                        </div>
                      </td>

                      {/* Performed By */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg gradient-purple-blue flex items-center justify-center text-[10px] font-bold text-white uppercase flex-shrink-0">
                            {log.performedByName.charAt(0)}
                          </div>
                          <span className="text-sm text-navy-300">{log.performedByName}</span>
                        </div>
                      </td>

                      {/* Target */}
                      <td className="px-5 py-4 text-sm text-navy-300">
                        {log.targetUserName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-purple/10 text-accent-purple text-xs font-medium">
                            <User className="w-3 h-3" />
                            {log.targetUserName}
                          </span>
                        ) : log.recordId ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-blue/10 text-accent-blue text-xs font-medium">
                            <FileText className="w-3 h-3" />
                            Record #{log.recordId}
                          </span>
                        ) : (
                          <span className="text-navy-500">—</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-4 text-sm text-navy-400">
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
