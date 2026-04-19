import React, { useState, useMemo } from 'react';
import { Warehouse, Product } from '../../types';
import { Box, Plus, Search, Edit2, Trash2, ArrowRightLeft, X, Save } from 'lucide-react';

interface Props {
  warehouses: Warehouse[];
  products: Product[];
  onAddWarehouse: (data: Partial<Warehouse>) => Promise<void>;
  onUpdateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  onDeleteWarehouse: (id: string) => Promise<void>;
  onTransfer: (data: any) => Promise<void>;
}

const WarehouseManager: React.FC<Props> = ({ warehouses, products, onAddWarehouse, onUpdateWarehouse, onDeleteWarehouse, onTransfer }) => {
  const [activeTab, setActiveTab] = useState<'warehouses' | 'transfer'>('warehouses');
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingWH, setEditingWH] = useState<Warehouse | null>(null);
  
  // Search
  const [search, setSearch] = useState('');

  const filteredWHs = useMemo(() => {
    return warehouses.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
  }, [warehouses, search]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      address: fd.get('address') as string,
      manager: fd.get('manager') as string,
      phone: fd.get('phone') as string,
    };
    if (editingWH) {
      await onUpdateWarehouse(editingWH.id, data);
    } else {
      await onAddWarehouse(data);
    }
    setShowModal(false);
    setEditingWH(null);
  };

  const TransferTab = () => {
    const [productId, setProductId] = useState('');
    const [fromWh, setFromWh] = useState('');
    const [toWh, setToWh] = useState('');
    const [qty, setQty] = useState(1);
    const [reason, setReason] = useState('');

    const handleTransfer = async () => {
      if (!productId || !fromWh || !toWh || qty < 1) return alert('Vui lòng điền đủ thông tin');
      if (fromWh === toWh) return alert('Kho nhận phải khác kho xuất');
      await onTransfer({
        productId,
        fromWarehouse: warehouses.find(w => w.id === fromWh)?.name,
        toWarehouse: warehouses.find(w => w.id === toWh)?.name,
        quantity: qty,
        reason,
        performedBy: 'admin' // In real app, from user state
      });
      alert('Chuyển kho thành công');
      setProductId('');
      setQty(1);
      setReason('');
    };

    return (
      <div className="p-6 max-w-2xl mx-auto bg-slate-50 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
          <ArrowRightLeft className="text-indigo-600" /> Luân chuyển hàng hóa
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Sản phẩm</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={productId} onChange={e => setProductId(e.target.value)}>
              <option value="">Chọn sản phẩm...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Từ Kho</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={fromWh} onChange={e => setFromWh(e.target.value)}>
                <option value="">Kho xuất...</option>
                {warehouses.map(w => <option key={w.id} value={w.id} disabled={w.id === toWh}>{w.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Đến Kho</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={toWh} onChange={e => setToWh(e.target.value)}>
                <option value="">Kho nhận...</option>
                {warehouses.map(w => <option key={w.id} value={w.id} disabled={w.id === fromWh}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Số lượng</label>
              <input type="number" min="1" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={qty} onChange={e => setQty(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Lý do chuyển..." value={reason} onChange={e => setReason(e.target.value)} />
            </div>
          </div>
          <button onClick={handleTransfer} className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            <ArrowRightLeft size={18} /> Thực hiện chuyển kho
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full animate-fade-in">
      {/* Tab header */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        <button 
            onClick={() => setActiveTab('warehouses')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'warehouses' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <Box size={18} /> Danh sách kho
            {activeTab === 'warehouses' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
        </button>
        <button 
            onClick={() => setActiveTab('transfer')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'transfer' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <ArrowRightLeft size={18} /> Luân chuyển
            {activeTab === 'transfer' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'warehouses' && (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" placeholder="Tìm kho hàng..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => { setEditingWH(null); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
              <Plus size={16} /> Thêm kho mới
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWHs.map(w => (
              <div key={w.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Box className="text-indigo-500" size={20} /> {w.name}
                  </h4>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingWH(w); setShowModal(true); }} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                    <button onClick={() => { if(confirm('Chắc chắn xóa?')) onDeleteWarehouse(w.id); }} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="text-sm text-slate-600 space-y-1 mt-2">
                  <p><span className="font-semibold">Quản lý:</span> {w.manager || 'Chưa có'}</p>
                  <p><span className="font-semibold">SĐT:</span> {w.phone || 'Chưa có'}</p>
                  <p className="truncate"><span className="font-semibold">Địa chỉ:</span> {w.address}</p>
                </div>
              </div>
            ))}
            {filteredWHs.length === 0 && <div className="col-span-3 text-center py-10 text-slate-500">Không có dữ liệu kho hàng</div>}
          </div>
        </div>
      )}

      {activeTab === 'transfer' && <TransferTab />}

      {/* WH Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingWH ? 'Sửa Kho' : 'Thêm Kho Mới'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Tên kho</label><input required name="name" defaultValue={editingWH?.name} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Quản lý (Tên)</label><input name="manager" defaultValue={editingWH?.manager} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Điện thoại</label><input name="phone" defaultValue={editingWH?.phone} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ</label><input required name="address" defaultValue={editingWH?.address} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-bold">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Save size={16}/> Lưu thông tin</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WarehouseManager;
