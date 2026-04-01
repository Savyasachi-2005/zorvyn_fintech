import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import type { SummaryData } from '../../types';

interface SummaryCardsProps {
  data: SummaryData;
  loading?: boolean;
}

const cards = [
  {
    key: 'income',
    label: 'Total Income',
    icon: TrendingUp,
    gradient: 'gradient-emerald-cyan',
    textColor: 'text-accent-emerald',
    getValue: (d: SummaryData) => d.totalIncome,
  },
  {
    key: 'expense',
    label: 'Total Expense',
    icon: TrendingDown,
    gradient: 'gradient-rose-amber',
    textColor: 'text-accent-rose',
    getValue: (d: SummaryData) => d.totalExpense,
  },
  {
    key: 'balance',
    label: 'Net Balance',
    icon: DollarSign,
    gradient: 'gradient-purple-blue',
    textColor: 'text-accent-purple',
    getValue: (d: SummaryData) => d.balance,
  },
  {
    key: 'records',
    label: 'Total Records',
    icon: FileText,
    gradient: 'gradient-cyan-blue',
    textColor: 'text-accent-cyan',
    getValue: (d: SummaryData) => d.recordCount,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SummaryCards({ data, loading }: SummaryCardsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {cards.map((card) => {
        const value = card.getValue(data);
        const isMonetary = card.key !== 'records';

        return (
          <motion.div
            key={card.key}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-5 cursor-pointer group"
          >
            {loading ? (
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-navy-700 animate-pulse" />
                <div className="w-24 h-4 rounded bg-navy-700 animate-pulse" />
                <div className="w-16 h-6 rounded bg-navy-700 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-accent-emerald">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12%</span>
                  </div>
                </div>
                <p className="text-sm text-navy-300 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {isMonetary ? formatCurrency(value) : value.toLocaleString()}
                </p>
              </>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
