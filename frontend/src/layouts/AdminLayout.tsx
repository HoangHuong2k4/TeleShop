import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  UserCircle, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Bot, 
  ShoppingCart,
  ShieldCheck,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isAdmin = user.role === 'ADMIN';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Sản phẩm', icon: Package, path: '/admin/products', hidden: isAdmin },
    { name: 'Kho hàng', icon: Database, path: '/admin/accounts', hidden: isAdmin },
    { name: 'Bots', icon: Bot, path: '/admin/bots', hidden: isAdmin },
    { name: 'Đơn hàng', icon: ShoppingCart, path: '/admin/orders', hidden: isAdmin },
    { name: 'Thành viên', icon: Users, path: '/admin/users', hidden: !isAdmin },
  ].filter(item => !item.hidden);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-300">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-64 glass border-r z-50 flex flex-col"
          >
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">
                TeleShop
              </h1>
            </div>

            <nav className="flex-1 mt-6 px-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                    location.pathname === item.path 
                      ? "bg-violet-600/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10" 
                      : "hover:bg-slate-800/50 hover:text-slate-100"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    location.pathname === item.path ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="font-medium">{item.name}</span>
                  {location.pathname === item.path && (
                    <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 shadow-glow" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 glass border-b flex items-center justify-between px-6 z-40">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-lg relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-100">{user.email || 'Admin'}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role || 'USER'} - {user.plan || 'BASIC'}</p>
              </div>
              <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full overflow-hidden flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
