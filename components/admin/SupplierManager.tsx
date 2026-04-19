import React, { useState, useMemo } from 'react';
import { Supplier, PurchaseOrder, Product } from '../../types';
import { Truck, Plus, Search, Edit2, Trash2, CheckCircle, Package, Clock, X, Save } from 'lucide-react';

interface Props {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onAddSupplier: (data: Partial<Supplier>) => Promise<void>;
  onUpdateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  onDeleteSupplier: (id: string) => Promise<void>;
  onCreatePO: (data: Partial<PurchaseOrder>) => Promise<void>;
  onUpdatePOStatus: (id: string, status: string) => Promise<void>;
}

const SupplierManager: React.FC<Props> = ({ suppliers, purchaseOrders, products, onAddSupplier, onUpdateSupplier, onDeleteSupplier, onCreatePO, onUpdatePOStatus }) => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers');
  
  // Modals state
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  const [showPOModal, setShowPOModal] = useState(false);
  
  // Search
  const [supplierSearch, setSupplierSearch] = useState('');
  const [poSearch, setPoSearch] = useState('');

  // ─── SUPPLIERS ───
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()));
  }, [suppliers, supplierSearch]);

  const handleSaveSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      contact: fd.get('contact') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      address: fd.get('address') as string,
    };
    if (editingSupplier) {
      await onUpdateSupplier(editingSupplier.id, data);
    } else {
      await onAddSupplier(data);
    }
    setShowSupplierModal(false);
    setEditingSupplier(null);
  };

  // ─── PURCHASE ORDERS ───
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => po.id.toLowerCase().includes(poSearch.toLowerCase()) || po.supplierName.toLowerCase().includes(poSearch.toLowerCase()));
  }, [purchaseOrders, poSearch]);

  const CreatePOModal = () => {
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [items, setItems] = useState<{ productId: string, quantity: number, unitCost: number }[]>([]);

    const handleCreate = async () => {
      if (!selectedSupplier || items.length === 0) return alert('Vui lòng chọn nhà cung cấp và thêm ít nhất 1 sản phẩm');
      
      const supplier = suppliers.find(s => s.id === selectedSupplier);
      
      const poItems = items.map(it => {
        const p = products.find(prod => prod.id === it.productId);
        return {
          productId: it.productId,
          productName: p?.name || '',
          quantity: it.quantity,
          unitCost: it.unitCost,
          totalCost: it.quantity * it.unitCost
        };
      });

      await onCreatePO({
        supplierId: selectedSupplier,
        supplierName: supplier?.name || '',
        items: poItems,
      });
      setShowPOModal(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Tạo Đơn Nhập Hàng</h3>
            <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nhà cung cấp</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                <option value="">Chọn nhà cung cấp...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-semibold text-slate-700">Sản phẩm</label>
                <button 
                  onClick={() => setItems([...items, { productId: '', quantity: 1, unitCost: 0 }])}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md"
                >+ Thêm dòng</button>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select 
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      value={item.productId}
                      onChange={e => {
                        const newItems = [...items];
                        newItems[index].productId = e.target.value;
                        const p = products.find(x => x.id === e.target.value);
                        if (p) newItems[index].unitCost = p.costPrice || 0;
                        setItems(newItems);
                      }}
                    >
                      <option value="">Chọn sản phẩm...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" min="1" className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="SL" value={item.quantity} onChange={e => {
                      const newItems = [...items];
                      newItems[index].quantity = parseInt(e.target.value) || 0;
                      setItems(newItems);
                    }}/>
                    <input type="number" min="0" className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Giá nhập" value={item.unitCost} onChange={e => {
                      const newItems = [...items];
                      newItems[index].unitCost = parseInt(e.target.value) || 0;
                      setItems(newItems);
                    }}/>
                    <button onClick={() => {
                      const newItems = [...items];
                      newItems.splice(index, 1);
                      setItems(newItems);
                    }} className="text-rose-500 p-2"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right font-bold text-slate-800 text-lg mt-4">
              Tổng tiền: {items.reduce((acc, it) => acc + (it.quantity * it.unitCost), 0).toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
            <button onClick={() => setShowPOModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg text-sm">Hủy</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex items-center gap-2">
              <Save size={16} /> Tạo Đơn
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      {/* Tab header */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        <button 
            onClick={() => setActiveTab('suppliers')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'suppliers' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <Truck size={18} /> Nhà cung cấp
            {activeTab === 'suppliers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
        </button>
        <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'orders' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <Package size={18} /> Đơn nhập hàng
            {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" placeholder="Tìm nhà cung cấp..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)} />
            </div>
            <button onClick={() => { setEditingSupplier(null); setShowSupplierModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
              <Plus size={16} /> Thêm nhà cung cấp
            </button>
          </div>
          <div className="overflow-x-auto flex-1 border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tên</th>
                  <th className="px-4 py-3 font-semibold">Liên hệ</th>
                  <th className="px-4 py-3 font-semibold">Điện thoại</th>
                  <th className="px-4 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.contact}</td>
                    <td className="px-4 py-3 text-slate-600">{s.phone}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => { setEditingSupplier(s); setShowSupplierModal(true); }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={16}/></button>
                      <button onClick={() => { if(confirm('Chắc chắn xóa?')) onDeleteSupplier(s.id); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" placeholder="Tìm mã đơn..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={poSearch} onChange={e => setPoSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowPOModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
              <Plus size={16} /> Tạo Đơn Nhập Hàng
            </button>
          </div>
          <div className="overflow-x-auto flex-1 border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Mã Đơn</th>
                  <th className="px-4 py-3 font-semibold">Nhà Cung Cấp</th>
                  <th className="px-4 py-3 font-semibold">Tổng Tiền</th>
                  <th className="px-4 py-3 font-semibold">Trạng Thái</th>
                  <th className="px-4 py-3 font-semibold">Ngày Tạo</th>
                  <th className="px-4 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPOs.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{po.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{po.supplierName}</td>
                    <td className="px-4 py-3 text-slate-600 font-semibold">{po.totalAmount.toLocaleString('vi-VN')} đ</td>
                    <td className="px-4 py-3">
                      {po.status === 'PENDING' && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Chờ xử lý</span>}
                      {po.status === 'COMPLETED' && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Hoàn tất</span>}
                      {po.status === 'CANCELLED' && <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">Đã hủy</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(po.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3">
                      {po.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => onUpdatePOStatus(po.id, 'COMPLETED')} className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> Nhập kho</button>
                          <button onClick={() => onUpdatePOStatus(po.id, 'CANCELLED')} className="px-2 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded text-xs font-bold">Hủy</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSaveSupplier} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingSupplier ? 'Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp'}</h3>
              <button type="button" onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Tên công ty</label><input required name="name" defaultValue={editingSupplier?.name} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Người liên hệ</label><input name="contact" defaultValue={editingSupplier?.contact} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email</label><input type="email" name="email" defaultValue={editingSupplier?.email} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Điện thoại</label><input name="phone" defaultValue={editingSupplier?.phone} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ</label><input name="address" defaultValue={editingSupplier?.address} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowSupplierModal(false)} className="px-4 py-2 text-slate-600 font-bold">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Lưu thông tin</button>
            </div>
          </form>
        </div>
      )}

      {showPOModal && <CreatePOModal />}
    </div>
  );
};

export default SupplierManager;
