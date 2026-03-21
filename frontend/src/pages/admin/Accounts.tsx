import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Trash2, 
  Edit3, 
  Loader2, 
  Upload, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Hash,
  Plus,
  X,
  Save
} from 'lucide-react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Account {
  id: number;
  productId: number;
  content: string;
  isSold: boolean;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
}

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({ content: '', isSold: false });
  const [submitting, setSubmitting] = useState(false);

  const fetchInitialData = async () => {
    try {
      const botsRes = await api.get('/admin/bots');
      if (botsRes.data.length > 0) {
        const prodRes = await api.get(`/admin/products/${botsRes.data[0].id}`);
        setProducts(prodRes.data);
        if (prodRes.data.length > 0 && !selectedProductId) {
          setSelectedProductId(prodRes.data[0].id);
        }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const fetchAccounts = async (productId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/accounts/${productId}`);
      setAccounts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedProductId) fetchAccounts(selectedProductId);
  }, [selectedProductId]);

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({ content: account.content, isSold: account.isSold });
    } else {
      setEditingAccount(null);
      setFormData({ content: '', isSold: false });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    setSubmitting(true);
    try {
      if (editingAccount) {
        await api.put(`/admin/accounts/${editingAccount.id}`, formData);
      } else {
        await api.post('/admin/accounts', { ...formData, productId: selectedProductId });
      }
      setIsModalOpen(false);
      fetchAccounts(selectedProductId);
      setMessage({ type: 'success', text: 'Thao tác thành công' });
    } catch (err) { setMessage({ type: 'error', text: 'Lỗi' }); }
    finally { setSubmitting(false); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProductId) return;
    setImporting(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', selectedProductId.toString());
    try {
      const res = await api.post('/admin/accounts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: res.data.message });
      fetchAccounts(selectedProductId);
    } catch (err: any) { setMessage({ type: 'error', text: 'Lỗi import' }); }
    finally { setImporting(false); e.target.value = ''; }
  };

  const deleteAccount = async (id: number) => {
    if (!confirm('Xóa tài khoản này?')) return;
    try {
      await api.delete(`/admin/accounts/${id}`);
      setAccounts(accounts.filter(a => a.id !== id));
      setMessage({ type: 'success', text: 'Đã xóa' });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Kho tài khoản</h1>
          <p className="text-slate-400 mt-1">Quản lý kho hàng và nhập dữ liệu</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenModal()} className="btn-vip flex items-center gap-2"><Plus size={18} /> Thêm lẻ</button>
          <label className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition-all">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={18} />}
            Excel
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImport} disabled={importing} />
          </label>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={cn(
             "flex items-center gap-3 p-4 rounded-xl border mb-6",
             message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{message.text}</span>
            <button className="ml-auto" onClick={() => setMessage(null)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase px-2">Sản phẩm</h3>
          <div className="glass-card p-2 space-y-1">
            {products.map((p) => (
              <button key={p.id} onClick={() => setSelectedProductId(p.id)} className={cn(
                "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3",
                selectedProductId === p.id ? "bg-violet-600/20 text-white border border-violet-500/30" : "text-slate-400 hover:bg-slate-800"
              )}>
                <Hash size={16} className={selectedProductId === p.id ? "text-violet-400" : "text-slate-600"} />
                <span className="font-medium truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
               <h3 className="font-bold text-white flex items-center gap-2 pr-6">Danh sách ({accounts.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Nội dung</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right pr-12">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loading ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500"><Loader2 className="animate-spin mx-auto" /></td></tr>
                  ) : accounts.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">Chưa có dữ liệu.</td></tr>
                  ) : (
                    accounts.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4"><code className="text-xs bg-slate-900 px-2 py-1 rounded">{a.content}</code></td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border",
                            a.isSold ? "bg-slate-500/10 text-slate-500 border-slate-500/10" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          )}>{a.isSold ? 'Đã bán' : 'Sẵn có'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(a)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><Edit3 size={16} /></button>
                            <button onClick={() => deleteAccount(a.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-lg p-6 space-y-6 border-violet-500/30">
                <h3 className="text-xl font-bold text-white">{editingAccount ? 'Sửa tài khoản' : 'Thêm mới'}</h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <textarea required rows={3} className="input-vip w-full" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Nội dung/Code..." />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isSold" checked={formData.isSold} onChange={e => setFormData({...formData, isSold: e.target.checked})} />
                    <label htmlFor="isSold">Đã bán</label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-700 rounded-xl">Hủy</button>
                    <button disabled={submitting} type="submit" className="flex-1 btn-vip">Lưu</button>
                  </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function cn(...classes: any[]) { return classes.filter(Boolean).join(' '); }

export default Accounts;
