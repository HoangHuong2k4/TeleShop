import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit3, Search, ExternalLink, X, Loader2, Save } from 'lucide-react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  botId: number;
  _count?: {
    accounts: number;
  };
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [botId, setBotId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const botsRes = await api.get('/admin/bots');
      if (botsRes.data.length > 0) {
        const bId = botsRes.data[0].id;
        setBotId(bId);
        const res = await api.get(`/admin/products/${bId}`);
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botId) return;

    setSubmitting(true);
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/admin/products', { ...formData, botId });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Sản phẩm</h1>
          <p className="text-slate-400 mt-1">Quản lý danh sách dịch vụ và gói nạp</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-vip flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none transition-all opacity-80 focus:opacity-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Giá</th>
                <th className="px-6 py-4">Tồn kho</th>
                <th className="px-6 py-4 text-right pr-12">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Không tìm thấy sản phẩm nào.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
                          <Package className="text-violet-400" size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-violet-400 transition-colors">{product.name}</div>
                          <div className="text-xs text-slate-500">{product.description?.substring(0, 40) || 'Không có mô tả'}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-bold">
                      {product.price.toLocaleString()}đ
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {product._count?.accounts || 0} sản phẩm
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg overflow-hidden border-violet-500/30"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Tên sản phẩm</label>
                  <input required className="input-vip w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Giá bán (VNĐ)</label>
                  <input required type="number" className="input-vip w-full" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Mô tả</label>
                  <textarea rows={3} className="input-vip w-full resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300">Hủy</button>
                  <button disabled={submitting} type="submit" className="flex-1 btn-vip font-bold">{submitting ? 'Saving...' : 'Lưu lại'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
