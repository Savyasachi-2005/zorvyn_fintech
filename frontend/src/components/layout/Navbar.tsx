import { motion } from 'framer-motion';
import { Bell, Search, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();

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

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Theme toggle (decorative) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl bg-navy-800/50 border border-white/[0.06] flex items-center justify-center text-navy-300 hover:text-accent-purple hover:border-accent-purple/30 transition-all duration-200"
        >
          <Moon className="w-4 h-4" />
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-xl bg-navy-800/50 border border-white/[0.06] flex items-center justify-center text-navy-300 hover:text-accent-purple hover:border-accent-purple/30 transition-all duration-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-rose border-2 border-navy-950" />
        </motion.button>

        {/* User avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 pl-3 border-l border-white/[0.06] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg gradient-purple-blue flex items-center justify-center text-xs font-bold text-white uppercase">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-navy-400 capitalize">{user?.role || 'viewer'}</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
