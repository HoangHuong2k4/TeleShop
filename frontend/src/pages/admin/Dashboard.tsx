import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Users, Database, ShoppingCart, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { motion } from 'framer-motion';

interface Stats {
  totalUsers: number;
  totalBots: number;
  totalRevenue: number;
  totalInventory: number;
  recentOrders: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const isAdmin = JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN';

  const statCards = [
    { label: 'Tổng doanh thu', value: `${stats?.totalRevenue.toLocaleString()}đ`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Sản phẩm tồn kho', value: stats?.totalInventory, icon: Database, color: 'text-violet-400' },
    { label: 'Bot hoạt động', value: stats?.totalBots, icon: ShieldCheck, color: 'text-amber-400' },
    { label: 'Người dùng hệ thống', value: stats?.totalUsers, icon: Users, color: 'text-blue-400', hidden: !isAdmin },
  ].filter(card => !card.hidden);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isAdmin ? 'System Overview' : 'My Shop Dashboard'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isAdmin ? 'Tổng quan hoạt động toàn hệ thống TeleShop' : 'Quản lý hoạt động kinh doanh của bạn'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 group hover:border-violet-500/30"
          >
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <div className={cn("p-2 bg-slate-800/50 rounded-lg group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-violet-400" />
              Đơn hàng mới nhất
            </h3>
            <button className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Mã đơn</th>
                  <th className="px-6 py-4 font-semibold">Bot</th>
                  <th className="px-6 py-4 font-semibold">Số tiền</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats?.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-violet-400">#{order.paymentCode}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{order.bot?.botUsername || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-white">{order.totalAmount.toLocaleString()}đ</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        order.status === 'PAID' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                        order.status === 'PENDING' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats?.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">Chưa có đơn hàng nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Trạng thái hệ thống</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-300">API Server</span>
              </div>
              <span className="text-sm font-mono text-emerald-400">ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-300">Database</span>
              </div>
              <span className="text-sm font-mono text-emerald-400">Connected</span>
            </div>
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-300">Bot Webhooks</span>
              </div>
              <span className="text-sm font-mono text-emerald-400">ACTIVE</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-violet-600/10 border border-violet-500/20 rounded-2xl">
            <p className="text-xs text-violet-400 font-bold uppercase tracking-wider mb-2">Thông báo</p>
            <p className="text-sm text-slate-300">Tất cả các hệ thống đang hoạt động bình thường với hiệu suất tối ưu.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for Tailwind classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Dashboard;
