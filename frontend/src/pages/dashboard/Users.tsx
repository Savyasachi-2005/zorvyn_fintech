import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, ShieldCheck, ShieldX, MoreHorizontal, X, Lock, Mail, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
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

  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  // Menu and Modals State
  const [activeMenuUserId, setActiveMenuUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [modalActionLoading, setModalActionLoading] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: UserRole }>({ name: '', email: '', role: 'viewer' });
  const [resetForm, setResetForm] = useState({ password: '' });

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuUserId(null);
      setEditingRole(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    const toastId = toast.loading('Updating role...');
    try {
      const { data } = await api.put<UserFromAPI>(`/users/${userId}/role`, { role: newRole });
      const updated = normalizeUser(data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success(`Role updated to ${newRole}`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role', { id: toastId });
    }
    setEditingRole(null);
  };

  const handleToggleActive = async (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newStatus = !user.isActive;
    const toastId = toast.loading(newStatus ? 'Activating user...' : 'Deactivating user...');
    try {
      const { data } = await api.put<UserFromAPI>(`/users/${userId}/status`, {
        is_active: newStatus,
      });
      const updated = normalizeUser(data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success(newStatus ? 'User activated' : 'User deactivated', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status', { id: toastId });
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setIsEditModalOpen(true);
    setActiveMenuUserId(null);
  };

  const openResetModal = (user: User) => {
    setSelectedUser(user);
    setResetForm({ password: '' });
    setIsResetModalOpen(true);
    setActiveMenuUserId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalActionLoading(true);
    const toastId = toast.loading('Saving changes...');
    try {
      let finalUser = null;
      if (editForm.role !== selectedUser.role) {
        const { data: roleData } = await api.put<UserFromAPI>(`/users/${selectedUser.id}/role`, { role: editForm.role });
        finalUser = roleData;
      }
      const { data } = await api.put<UserFromAPI>(`/users/${selectedUser.id}`, {
        full_name: editForm.name,
        email: editForm.email,
      });
      finalUser = data;
      const updated = normalizeUser(finalUser);
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
      setIsEditModalOpen(false);
      toast.success('User updated', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user', { id: toastId });
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalActionLoading(true);
    const toastId = toast.loading('Resetting password...');
    try {
      await api.put(`/users/${selectedUser.id}/password`, {
        password: resetForm.password,
      });
      setIsResetModalOpen(false);
      toast.success('Password reset successfully', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password', { id: toastId });
    } finally {
      setModalActionLoading(false);
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
      className="space-y-6 relative"
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

      {/* Users Cards (mobile) */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map((user) => {
          const colors = roleColors[user.role];
          const RoleIcon = roleIcons[user.role];

          return (
            <div key={user.id} className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg gradient-purple-blue flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
                    {user.name.charAt(0) || user.email.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name || 'Unnamed'}</p>
                    <p className="text-xs text-navy-400 truncate">{user.email}</p>
                  </div>
                </div>
                <motion.button
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
              </div>

              <div className="flex items-center justify-between gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingRole(editingRole === user.id ? null : user.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all duration-200 ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  <RoleIcon className="w-3.5 h-3.5" />
                  {user.role}
                </motion.button>
                <span className="text-xs text-navy-400">
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <AnimatePresence>
                {editingRole === user.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {ROLES.map((role) => {
                      const rc = roleColors[role];
                      return (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(user.id, role)}
                          className={`px-2 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                            user.role === role ? `${rc.bg} ${rc.text}` : 'text-navy-300 bg-white/[0.03]'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {isAdmin && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openEditModal(user)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent-purple/10 text-accent-purple text-xs font-medium"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => openResetModal(user)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent-rose/10 text-accent-rose text-xs font-medium"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
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
                  const isLastRows = filteredUsers.length > 2 && index >= filteredUsers.length - 2;

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
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRole(editingRole === user.id ? null : user.id);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all duration-200 ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          {user.role}
                        </motion.button>

                        {/* Role dropdown */}
                        <AnimatePresence>
                          {editingRole === user.id && (
                            <motion.div
                              onClick={(e) => e.stopPropagation()}
                              initial={{ opacity: 0, scale: 0.9, y: isLastRows ? 5 : -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: isLastRows ? 5 : -5 }}
                              transition={{ duration: 0.15 }}
                              className={`absolute z-20 ${isLastRows ? 'bottom-full mb-1 top-auto' : 'top-full mt-1'} left-5 glass-card !rounded-lg p-1 min-w-[130px]`}
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
                      <td className="px-5 py-4 relative">
                        {isAdmin && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-navy-400 hover:text-white transition-colors relative z-20"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </motion.button>

                            <AnimatePresence>
                              {activeMenuUserId === user.id && (
                                <motion.div
                                  onClick={(e) => e.stopPropagation()}
                                  initial={{ opacity: 0, scale: 0.95, y: isLastRows ? 10 : -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: isLastRows ? 10 : -10 }}
                                  transition={{ duration: 0.15 }}
                                  className={`absolute right-5 ${isLastRows ? 'bottom-full mb-1 top-auto' : 'top-full mt-1'} w-40 rounded-lg bg-[#0f172a] shadow-lg border border-white/[0.06] p-1 z-30`}
                                >
                                  <button
                                    onClick={() => openEditModal(user)}
                                    className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-navy-300 hover:bg-white/[0.05] hover:text-white transition-all duration-150 flex items-center gap-2"
                                  >
                                    <UserIcon className="w-3.5 h-3.5" />
                                    Edit User
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingRole(user.id);
                                      setActiveMenuUserId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-navy-300 hover:bg-white/[0.05] hover:text-white transition-all duration-150 flex items-center gap-2 mt-1"
                                  >
                                    <Shield className="w-3.5 h-3.5" />
                                    Change Role
                                  </button>
                                  <button
                                    onClick={() => openResetModal(user)}
                                    className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-accent-rose hover:bg-accent-rose/10 transition-all duration-150 flex items-center gap-2 mt-1"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                    Reset Password
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto glass-card p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Edit User</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-navy-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-navy-300 mb-1.5">Full Name</label>
                   <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all font-medium"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-navy-300 mb-1.5">Email</label>
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all font-medium"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-navy-300 mb-1.5">Role</label>
                   <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all font-medium appearance-none"
                      >
                        {ROLES.map(r => (
                           <option key={r} value={r} className="bg-navy-800 text-white capitalize">{r}</option>
                        ))}
                      </select>
                   </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm font-medium text-navy-300 hover:text-white transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={modalActionLoading}
                    className="flex-1 py-2.5 rounded-xl gradient-purple-blue text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-accent-purple/20 transition-all disabled:opacity-50"
                  >
                    {modalActionLoading ? (
                       <div className="w-5 h-5 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {isResetModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto glass-card p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Reset Password</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsResetModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-navy-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-navy-300 mb-1.5">New Password</label>
                   <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="password"
                        value={resetForm.password}
                        onChange={(e) => setResetForm({ password: e.target.value })}
                        required
                        minLength={8}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all font-medium"
                      />
                   </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-navy-800/50 border border-white/[0.06] text-sm font-medium text-navy-300 hover:text-white transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={modalActionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-accent-rose text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-accent-rose/20 transition-all disabled:opacity-50"
                  >
                    {modalActionLoading ? (
                       <div className="w-5 h-5 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Reset Password'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
