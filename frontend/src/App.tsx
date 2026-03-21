import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { Products as AdminProducts, Users as AdminUsers, Accounts as AdminAccounts, Dashboard } from './pages/admin';
import { ShieldCheck } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="text-center glass-card p-12 max-w-lg">
      <ShieldCheck className="w-20 h-20 text-red-500 mx-auto mb-6 opacity-80" />
      <h1 className="text-4xl font-bold text-white mb-4">Truy cập bị từ chối</h1>
      <p className="text-slate-400 mb-8">Bạn không có quyền truy cập vào khu vực này. Vui lòng liên hệ quản trị viên if bạn tin rằng đây là một lỗi.</p>
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
        className="btn-vip"
      >
        Đăng nhập với tài khoản hợp lệ
      </button>
    </div>
  </div>
);


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="accounts" element={<AdminAccounts />} />
          <Route path="users" element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="bots" element={<div className="text-white">Bot Management</div>} />
          <Route path="orders" element={<div className="text-white">Order Management</div>} />
        </Route>

        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/admin" replace />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
