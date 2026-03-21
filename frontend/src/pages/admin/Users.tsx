import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  X, 
  Save, 
  User as UserIcon,
  Settings,
  Bot,
  Package,
  Database,
  CreditCard,
  Plus,
  ArrowLeft,
  Key
} from 'lucide-react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: number;
  email: string;
  role: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    bots: number;
  };
}

interface BotConfig {
  id: number;
  botToken: string;
  botUsername: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  sepayApiKey: string;
  isActive: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal/Drilldown state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForMgmt, setSelectedUserForMgmt] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({ role: 'USER', plan: 'FREE', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ role: user.role, plan: user.plan, isActive: user.isActive });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await api.put(`/admin/users/${editingUser.id}`, formData);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await api.put(`/admin/users/${user.id}`, {
        ...user,
        isActive: !user.isActive
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedUserForMgmt) {
    return <UserManagementDetail user={selectedUserForMgmt} onBack={() => {
      setSelectedUserForMgmt(null);
      fetchUsers();
    }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Thành viên</h1>
          <p className="text-slate-400 mt-1">Quản lý người dùng và tài khoản hệ thống</p>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Tìm theo email..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all opacity-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Sở hữu</th>
                <th className="px-6 py-4">Vai trò / Gói</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Không có người dùng nào.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr 
                    key={u.id} 
                    onClick={() => setSelectedUserForMgmt(u)}
                    className="hover:bg-slate-800/50 transition-all group cursor-pointer border-b border-slate-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/20 shadow-inner group-hover:scale-110 transition-transform">
                          <UserIcon size={18} className="text-violet-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-violet-400 transition-colors">{u.email}</div>
                          <div className="text-xs text-slate-500">Tham gia: {new Date(u.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Bot size={14} className="text-slate-500" />
                        <span>{(u as any)._count?.bots || 0} Bots</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${
                          u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {u.role}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{u.plan} PLAN</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUserStatus(u);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          u.isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Locked'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserForMgmt(u);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 rounded-lg text-xs font-bold border border-violet-500/20 transition-all shadow-sm hover:shadow-violet-500/20"
                        >
                          <Settings size={14} />
                          Quản lý
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(u);
                          }} 
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(u.id);
                          }} 
                          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md overflow-hidden border-violet-500/30"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Cấu hình thành viên</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-400 block mb-2">Vai trò hệ thống</label>
                  <select 
                    className="input-vip w-full bg-slate-900"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="USER">USER (Người dùng thường)</option>
                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 block mb-2">Gói dịch vụ</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['BASIC', 'PRO'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({...formData, plan: p})}
                        className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                          formData.plan === p ? "bg-violet-600/20 border-violet-500 text-white" : "bg-slate-900 border-slate-700 text-slate-500"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300">Hủy</button>
                  <button disabled={submitting} type="submit" className="flex-1 btn-vip flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                    Lưu
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* User Detail Management View */
const UserManagementDetail: React.FC<{ user: User, onBack: () => void }> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'bots' | 'payment' | 'inventory'>('bots');
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [loadingBots, setLoadingBots] = useState(true);

  const fetchUserBots = async () => {
    setLoadingBots(true);
    try {
      const res = await api.get(`/admin/bots?userId=${user.id}`);
      setBots(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingBots(false); }
  };

  useEffect(() => { fetchUserBots(); }, [user.id]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Quay lại danh sách</span>
        </button>
        <div className="text-right">
          <h2 className="text-xl font-bold text-white">{user.email}</h2>
          <p className="text-xs text-slate-500">ID: #{user.id} • Quản lý tài nguyên người dùng</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800 w-fit">
        {[
          { id: 'bots', label: 'Telegram Bots', icon: Bot },
          { id: 'payment', label: 'Cấu hình thanh toán', icon: CreditCard },
          { id: 'inventory', label: 'Sản phẩm & Kho', icon: Package },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative min-h-[500px]">
        {activeTab === 'bots' && <BotTab userId={user.id} bots={bots} onUpdate={fetchUserBots} />}
        {activeTab === 'payment' && <PaymentTab bots={bots} onUpdate={fetchUserBots} />}
        {activeTab === 'inventory' && <InventoryTab bots={bots} />}
      </div>
    </div>
  );
};

/* Bot Tab */
const BotTab: React.FC<{ userId: number, bots: BotConfig[], onUpdate: () => void }> = ({ userId, bots, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<BotConfig | null>(null);
  const [formData, setFormData] = useState({ botToken: '', botUsername: '' });
  const [loading, setLoading] = useState(false);

  const handleOpen = (bot?: BotConfig) => {
    if (bot) {
      setEditingBot(bot);
      setFormData({ botToken: bot.botToken, botUsername: bot.botUsername });
    } else {
      setEditingBot(null);
      setFormData({ botToken: '', botUsername: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBot) {
        await api.put(`/admin/bots/${editingBot.id}`, formData);
      } else {
        await api.post('/admin/bots', { ...formData, userId });
      }
      setIsModalOpen(false);
      onUpdate();
    } catch (err) { alert('Lỗi bot configuration'); }
    finally { setLoading(false); }
  };

  const deleteBot = async (id: number) => {
    if (!confirm('Xóa bot này?')) return;
    try {
      await api.delete(`/admin/bots/${id}`);
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Bot size={20} className="text-violet-400" /> Danh sách Bots</h3>
        <button onClick={() => handleOpen()} className="btn-vip py-2 px-4 text-sm flex items-center gap-2"><Plus size={16} /> Thêm Bot</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bots.map(bot => (
          <div key={bot.id} className="glass-card p-5 space-y-4 group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center border border-violet-500/20">
                  <Bot size={24} className="text-violet-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">@{bot.botUsername || 'Unknown'}</h4>
                  <p className="text-xs text-slate-500 truncate w-40">{bot.botToken}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpen(bot)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Edit3 size={16} /></button>
                <button onClick={() => deleteBot(bot.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 space-y-6 border-violet-500/30">
            <h3 className="text-xl font-bold text-white">{editingBot ? 'Sửa Bot' : 'Thêm Bot'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Telegram Bot Token</label>
                <input required className="input-vip w-full" value={formData.botToken} onChange={e => setFormData({...formData, botToken: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Username (không gồm @)</label>
                <input className="input-vip w-full" value={formData.botUsername} onChange={e => setFormData({...formData, botUsername: e.target.value})} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-300">Hủy</button>
                <button disabled={loading} type="submit" className="flex-1 btn-vip">{loading ? 'Saving...' : 'Lưu lại'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* Payment Tab */
const PaymentTab: React.FC<{ bots: BotConfig[], onUpdate: () => void }> = ({ bots, onUpdate }) => {
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(bots[0] || null);
  const [formData, setFormData] = useState({ bankName: '', bankAccount: '', bankOwner: '', sepayApiKey: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBot) {
      setFormData({
        bankName: selectedBot.bankName || '',
        bankAccount: selectedBot.bankAccount || '',
        bankOwner: selectedBot.bankOwner || '',
        sepayApiKey: selectedBot.sepayApiKey || '',
      });
    }
  }, [selectedBot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBot) return;
    setLoading(true);
    try {
      await api.put(`/admin/bots/${selectedBot.id}`, formData);
      alert('Cập nhật cấu hình thanh toán thành công');
      onUpdate();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase px-2">Chọn Bot cấu hình</h3>
        <div className="glass-card p-2 space-y-1">
          {bots.map(b => (
            <button key={b.id} onClick={() => setSelectedBot(b)} className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedBot?.id === b.id ? 'bg-violet-600/20 text-white border border-violet-500/30' : 'text-slate-400 hover:bg-slate-800'}`}>
              <span className="truncate block font-bold">@{b.botUsername}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="md:col-span-3">
        {selectedBot ? (
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard className="text-violet-400" /> Cấu hình thanh toán (@{selectedBot.botUsername})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Tên ngân hàng</label>
                <input className="input-vip w-full" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="VD: MB Bank" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Số tài khoản</label>
                <input className="input-vip w-full" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} placeholder="000123456789" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Chủ tài khoản</label>
                <input className="input-vip w-full" value={formData.bankOwner} onChange={e => setFormData({...formData, bankOwner: e.target.value})} placeholder="NGUYEN VAN A" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-2"><Key size={14} className="text-violet-500" /> Sepay API Key</label>
                <input className="input-vip w-full" value={formData.sepayApiKey} onChange={e => setFormData({...formData, sepayApiKey: e.target.value})} placeholder="SP_..." />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-vip w-full py-4 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Lưu cấu hình
            </button>
          </form>
        ) : <div className="glass-card p-12 text-center text-slate-500">Vui lòng chọn hoặc thêm bot trước.</div>}
      </div>
    </div>
  );
};

/* Inventory & Products Tab (Full Management) */
const InventoryTab: React.FC<{ bots: BotConfig[] }> = ({ bots }) => {
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(bots[0] || null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<any | null>(null);
  const [editingAcc, setEditingAcc] = useState<any | null>(null);
  
  const [prodForm, setProdForm] = useState({ name: '', price: '', description: '' });
  const [accForm, setAccForm] = useState({ content: '', isSold: false });

  const fetchProducts = async (botId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/products/${botId}`);
      setProducts(res.data);
      if (res.data.length > 0) setSelectedProduct(res.data[0]);
      else { setSelectedProduct(null); setAccounts([]); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAccounts = async (productId: number) => {
    try {
      const res = await api.get(`/admin/accounts/${productId}`);
      setAccounts(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (selectedBot) fetchProducts(selectedBot.id);
  }, [selectedBot]);

  useEffect(() => {
    if (selectedProduct) fetchAccounts(selectedProduct.id);
  }, [selectedProduct]);

  const handleProdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBot) return;
    try {
      if (editingProd) await api.put(`/admin/products/${editingProd.id}`, prodForm);
      else await api.post('/admin/products', { ...prodForm, botId: selectedBot.id });
      setIsProdModalOpen(false);
      fetchProducts(selectedBot.id);
    } catch (err) { console.error(err); }
  };

  const handleAccSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      if (editingAcc) await api.put(`/admin/accounts/${editingAcc.id}`, accForm);
      else await api.post('/admin/accounts', { ...accForm, productId: selectedProduct.id });
      setIsAccModalOpen(false);
      fetchAccounts(selectedProduct.id);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase px-2 tracking-widest">Chọn Bot</h3>
          <div className="glass-card p-2 space-y-1">
            {bots.map(b => (
              <button key={b.id} onClick={() => setSelectedBot(b)} className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedBot?.id === b.id ? 'bg-violet-600/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10' : 'text-slate-400 hover:bg-slate-800'}`}>
                <span className="truncate block font-bold">@{b.botUsername}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedBot && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sản phẩm</h3>
              <button onClick={() => { setEditingProd(null); setProdForm({ name: '', price: '', description: '' }); setIsProdModalOpen(true); }} className="p-1.5 bg-violet-600/20 text-violet-400 rounded-lg border border-violet-500/20 hover:scale-110 transition-transform">
                <Plus size={14} />
              </button>
            </div>
            <div className="glass-card p-2 space-y-1">
              {products.map(p => (
                <button key={p.id} onClick={() => setSelectedProduct(p)} className={`w-full text-left px-4 py-3 rounded-xl transition-all group ${selectedProduct?.id === p.id ? 'bg-violet-600/20 text-white border border-violet-500/30' : 'text-slate-400 hover:bg-slate-800'}`}>
                  <div className="flex justify-between items-center">
                    <span className="truncate font-bold">{p.name}</span>
                    <Settings size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setEditingProd(p); setProdForm({ name: p.name, price: p.price.toString(), description: p.description || '' }); setIsProdModalOpen(true); }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-3 space-y-6">
        {selectedProduct ? (
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 pr-6">
                   <Database size={20} className="text-violet-400" />
                   Kho hàng: {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Quản lý tài khoản cho sản phẩm này</p>
              </div>
              <button onClick={() => { setEditingAcc(null); setAccForm({ content: '', isSold: false }); setIsAccModalOpen(true); }} className="btn-vip py-2 px-4 text-xs flex items-center gap-2">
                <Plus size={14} /> Thêm tài khoản
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/20 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Dữ liệu tài khoản</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right pr-12">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {accounts.map(a => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-slate-300">
                        <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800 w-fit">{a.content}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${a.isSold ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {a.isSold ? 'Đã bán' : 'Sẵn có'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingAcc(a); setAccForm({ content: a.content, isSold: a.isSold }); setIsAccModalOpen(true); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Edit3 size={14} /></button>
                          <button onClick={async () => { if(confirm('Xóa?')) { await api.delete(`/admin/accounts/${a.id}`); fetchAccounts(selectedProduct.id); } }} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-600">Sản phẩm này hiện chưa có tài khoản nào trong kho.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card p-20 text-center space-y-4">
            <Package size={48} className="mx-auto text-slate-800" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-600">Chưa chọn sản phẩm</h3>
              <p className="text-sm text-slate-600">Chọn một sản phẩm từ danh sách bên trái để quản lý kho hàng.</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isProdModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 border-violet-500/30">
            <h3 className="text-lg font-bold text-white mb-6 pr-6">{editingProd ? 'Sửa sản phẩm' : 'Thêm sản phẩm cho bot'}</h3>
            <form onSubmit={handleProdSubmit} className="space-y-4">
              <input required className="input-vip w-full" placeholder="Tên sản phẩm" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} />
              <input required type="number" className="input-vip w-full" placeholder="Giá bán (VNĐ)" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} />
              <textarea className="input-vip w-full" placeholder="Mô tả..." rows={3} value={prodForm.description} onChange={e => setProdForm({...prodForm, description: e.target.value})} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsProdModalOpen(false)} className="flex-1 py-3 border border-slate-700 rounded-xl">Hủy</button>
                <button type="submit" className="flex-1 btn-vip">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {isAccModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 border-violet-500/30">
            <h3 className="text-lg font-bold text-white mb-6 pr-6">{editingAcc ? 'Sửa tài khoản' : 'Thêm tài khoản vào kho'}</h3>
            <form onSubmit={handleAccSubmit} className="space-y-4">
              <textarea required className="input-vip w-full" placeholder="Nội dung tài khoản..." rows={4} value={accForm.content} onChange={e => setAccForm({...accForm, content: e.target.value})} />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isSoldNested" checked={accForm.isSold} onChange={e => setAccForm({...accForm, isSold: e.target.checked})} />
                <label htmlFor="isSoldNested" className="text-sm text-slate-400">Đã bán</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAccModalOpen(false)} className="flex-1 py-3 border border-slate-700 rounded-xl">Hủy</button>
                <button type="submit" className="flex-1 btn-vip">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
