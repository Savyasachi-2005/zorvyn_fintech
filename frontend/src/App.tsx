import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Records from './pages/dashboard/Records';
import Analytics from './pages/dashboard/Analytics';
import Users from './pages/dashboard/Users';
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
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-[260px] transition-all duration-300">
        <Navbar />
        <main className="p-6">
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
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
