import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SupabaseProvider } from '@/context/SupabaseContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useSupabase } from '@/context/SupabaseContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Sales from '@/pages/Sales';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Suppliers from '@/pages/Suppliers';
import AccountsReceivable from '@/pages/AccountsReceivable';
import AccountsPayable from '@/pages/AccountsPayable';
import Marketing from '@/pages/Marketing';
import Banks from '@/pages/Banks';
import Categories from '@/pages/Categories';
import Customers from '@/pages/Customers';
import Layout from '@/components/Layout';
import '@/styles/globals.css';
import { useEffect, useState } from 'react';

function AppRoutes() {
  const { state } = useSupabase();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (state.isAuthLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Loading timeout reached, forcing app to continue');
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [state.isAuthLoading]);

  // Show loading screen only if still loading and timeout hasn't been reached
  if (state.isAuthLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
          <p className="text-gray-400 text-sm mt-2">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // If timeout reached or not authenticated, show login
  if (!state.user || loadingTimeout) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="products" 
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="categories" 
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="customers" 
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="sales" 
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="suppliers" 
          element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="accounts-receivable" 
          element={
            <ProtectedRoute>
              <AccountsReceivable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="accounts-payable" 
          element={
            <ProtectedRoute>
              <AccountsPayable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="marketing" 
          element={
            <ProtectedRoute>
              <Marketing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="banks" 
          element={
            <ProtectedRoute>
              <Banks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="flowi-admin-theme">
      <SupabaseProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <AppRoutes />
            <Toaster 
              position="top-right" 
              theme="light"
              className="toaster group"
              toastOptions={{
                classNames: {
                  toast: "group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-orange-200 group-[.toaster]:shadow-flowi group-[.toaster]:backdrop-blur-sm",
                  description: "group-[.toast]:text-gray-600",
                  actionButton: "group-[.toast]:bg-orange-500 group-[.toast]:text-white",
                  cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600",
                },
              }}
            />
          </div>
        </Router>
      </SupabaseProvider>
    </ThemeProvider>
  );
}