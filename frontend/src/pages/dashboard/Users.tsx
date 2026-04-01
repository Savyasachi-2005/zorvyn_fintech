import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, ShieldCheck, ShieldX, MoreHorizontal } from 'lucide-react';
import api from '../../lib/api';
import type { User, UserRole, UserFromAPI } from '../../types';
import { normalizeUser } from '../../types';

const ROLES: UserRole[] = ['viewer', 'analyst', 'admin'];

const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
  viewer: { bg: 'bg-accent-blue/10', text: 'text-accent-blue', border: 'border-accent-blue/20' },
  analyst: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', border: 'border-accent-purple/20' },
  admin: { bg: 'bg-accent-emerald/10', text: 'text-accent-emerald', border: 'border-accent-emerald/20' },
};

const roleIcons: Record<UserRole, typeof Shield> = {
  viewer: Shield,
  analyst: ShieldCheck,
  admin: ShieldX,
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<UserFromAPI[]>('/users');
        setUsers(data.map(normalizeUser));
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      const { data } = await api.put<UserFromAPI>(`/users/${userId}/role`, { role: newRole });
      const updated = normalizeUser(data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to update role');
    }
    setEditingRole(null);
  };

  const handleToggleActive = async (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    try {
      const { data } = await api.put<UserFromAPI>(`/users/${userId}/status`, {
        is_active: !user.isActive,
      });
      const updated = normalizeUser(data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to update status');
    }
  };

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
          User Management
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-navy-400 mt-1"
        >
          {filteredUsers.length} users registered
        </motion.p>
      </div>

      {/* Role stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role).length;
          const Icon = roleIcons[role];
          const colors = roleColors[role];
          return (
            <motion.div
              key={role}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-sm text-navy-400 capitalize">{role}s</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input
          id="users-search"
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all duration-200"
        />
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
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
                {filteredUsers.map((user, index) => {
                  const colors = roleColors[user.role];
                  const RoleIcon = roleIcons[user.role];

                  return (
                    <motion.tr
                      key={user.id}
                      custom={index}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 20 }}
                      layout
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200"
                    >
                      {/* User info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg gradient-purple-blue flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
                            {user.name.charAt(0) || user.email.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name || 'Unnamed'}</p>
                            <p className="text-xs text-navy-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4 relative">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingRole(editingRole === user.id ? null : user.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all duration-200 ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          {user.role}
                        </motion.button>

                        {/* Role dropdown */}
                        <AnimatePresence>
                          {editingRole === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute z-20 top-full left-5 mt-1 glass-card !rounded-lg p-1 min-w-[130px]"
                            >
                              {ROLES.map((role) => {
                                const rc = roleColors[role];
                                return (
                                  <button
                                    key={role}
                                    onClick={() => handleRoleChange(user.id, role)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium capitalize transition-all duration-150 ${
                                      user.role === role
                                        ? `${rc.bg} ${rc.text}`
                                        : 'text-navy-300 hover:bg-white/[0.05] hover:text-white'
                                    }`}
                                  >
                                    {role}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleActive(user.id)}
                          className="relative"
                        >
                          <div
                            className={`w-11 h-6 rounded-full transition-colors duration-300 ${
                              user.isActive ? 'bg-accent-emerald/20' : 'bg-navy-700'
                            }`}
                          >
                            <motion.div
                              animate={{ x: user.isActive ? 20 : 2 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className={`absolute top-1 w-4 h-4 rounded-full transition-colors duration-300 ${
                                user.isActive ? 'bg-accent-emerald' : 'bg-navy-500'
                              }`}
                            />
                          </div>
                        </motion.button>
                      </td>

                      {/* Joined date */}
                      <td className="px-5 py-4 text-sm text-navy-300">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-navy-400 hover:text-white transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-navy-400">
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
