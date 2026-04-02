import { motion } from 'framer-motion';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function Navbar({ onOpenMobileSidebar, collapsed, onToggleCollapsed }: NavbarProps) {

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06]"
      style={{
        background: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="inline-flex items-center justify-center rounded-lg p-2 text-navy-300 hover:bg-white/5 hover:text-white transition-colors lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden lg:inline-flex items-center justify-center rounded-lg p-2 text-navy-300 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>
      <div></div>
    </motion.header>
  );
}
