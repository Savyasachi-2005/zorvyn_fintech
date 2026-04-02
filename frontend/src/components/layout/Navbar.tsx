import { motion } from 'framer-motion';
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
      <div></div>
      <div></div>
    </motion.header>
  );
}
