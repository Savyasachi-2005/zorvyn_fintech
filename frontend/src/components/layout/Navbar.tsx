import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function Navbar() {

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-white/[0.06]"
      style={{
        background: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white placeholder:text-navy-400 focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right section empty, kept for balance if needed */}
      <div></div>
    </motion.header>
  );
}
