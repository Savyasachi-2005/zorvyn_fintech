import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Records from './pages/dashboard/Records';
import Analytics from './pages/dashboard/Analytics';
import Users from './pages/dashboard/Users';
import AuditLogs from './pages/dashboard/AuditLogs';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Dashboard layout with sidebar + navbar
function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        collapsed={desktopCollapsed}
        onToggleCollapsed={() => setDesktopCollapsed((prev) => !prev)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${desktopCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'}`}
      >
        <Navbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          collapsed={desktopCollapsed}
          onToggleCollapsed={() => setDesktopCollapsed((prev) => !prev)}
        />
        <main className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#151d35',
            color: '#e2e8f0',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#151d35' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#151d35' },
          },
          loading: {
            iconTheme: { primary: '#8b5cf6', secondary: '#151d35' },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              }
            />
            <Route
              path="/dashboard/records"
              element={
                <PageTransition>
                  <Records />
                </PageTransition>
              }
            />
          </Route>
        </Route>

        {/* Analyst + Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['analyst', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard/analytics"
              element={
                <PageTransition>
                  <Analytics />
                </PageTransition>
              }
            />
          </Route>
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard/users"
              element={
                <PageTransition>
                  <Users />
                </PageTransition>
              }
            />
            <Route
              path="/dashboard/logs"
              element={
                <PageTransition>
                  <AuditLogs />
                </PageTransition>
              }
            />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
