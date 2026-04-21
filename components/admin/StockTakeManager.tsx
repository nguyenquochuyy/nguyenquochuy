import React, { useState, useMemo } from 'react';
import { StockTake, Product } from '../../types';
import { ClipboardCheck, Search, AlertTriangle, CheckCircle, Plus, X, Save } from 'lucide-react';

interface Props {
  stockTakes: StockTake[];
  products: Product[];
  onRecordStockTake: (data: { productId: string, variantId?: string, actual: number, note: string }) => Promise<void>;
}

const StockTakeManager: React.FC<Props> = ({ stockTakes, products, onRecordStockTake }) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTakes = useMemo(() => {
    return stockTakes
      .filter(st => st.productName.toLowerCase().includes(search.toLowerCase()) || st.note.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stockTakes, search]);

  const StockTakeModal = () => {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');
    const [actualStock, setActualStock] = useState<number | ''>('');
    const [note, setNote] = useState('');

    const product = products.find(p => p.id === selectedProduct);
    const expectedStock = product ? (product.hasVariants && selectedVariant ? product.variants.find(v => v.id === selectedVariant)?.stock : product.stock) || 0 : 0;
    const diff = (typeof actualStock === 'number' ? actualStock : 0) - expectedStock;

    const handleSave = async () => {
      if (!selectedProduct || actualStock === '') return alert('Vui lòng điền đủ thông tin');
      await onRecordStockTake({
        productId: selectedProduct,
        variantId: selectedVariant,
        actual: actualStock as number,
        note
      });
      alert('Kiểm kê thành công!');
      setShowModal(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-fade-in">
        <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-lg flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><ClipboardCheck size={20} className="text-indigo-600"/> Ghi nhận Kiểm Kê</h3>
            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
          </div>
          <div className="p-6 space-y-[15px]">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sản phẩm</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={selectedProduct} onChange={e => { setSelectedProduct(e.target.value); setSelectedVariant(''); }}>
                <option value="">Chọn sản phẩm...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {product && product.hasVariants && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phân loại</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={selectedVariant} onChange={e => setSelectedVariant(e.target.value)}>
                  <option value="">Chọn phân loại...</option>
                  {product.variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            )}

            {(selectedProduct && (!product?.hasVariants || selectedVariant)) ? (
              <div className="grid grid-cols-3 gap-[15px]">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <span className="block text-xs text-slate-500 font-semibold mb-1">Tồn lý thuyết</span>
                  <span className="text-lg font-bold text-slate-800">{expectedStock}</span>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tồn thực tế</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border border-indigo-300 ring-2 ring-indigo-50 rounded-lg text-sm font-bold" placeholder="Nhập số đếm..." value={actualStock} onChange={e => setActualStock(e.target.value === '' ? '' : parseInt(e.target.value) || 0)} />
                </div>
              </div>
            ) : null}

            {typeof actualStock === 'number' && (selectedProduct && (!product?.hasVariants || selectedVariant)) && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${diff === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                {diff === 0 ? <CheckCircle className="shrink-0 mt-0.5" size={18} /> : <AlertTriangle className="shrink-0 mt-0.5" size={18} />}
                <div>
                  <h4 className="font-bold text-sm">{diff === 0 ? 'Khớp số liệu' : 'Lệch số liệu'}</h4>
                  <p className="text-sm mt-0.5">
                    {diff === 0 ? 'Số lượng thực tế khớp với hệ thống.' : `Thực tế ${diff > 0 ? 'dư' : 'thiếu'} ${Math.abs(diff)} sản phẩm. Hệ thống sẽ tự động cập nhật.`}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú (bắt buộc nếu lệch)</label>
              <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={3} placeholder="Lý do..." value={note} onChange={e => setNote(e.target.value)}></textarea>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg text-sm">Hủy</button>
            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex items-center gap-2">
              <Save size={16} /> Lưu kiểm kê
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ClipboardCheck className="text-indigo-600"/> Lịch sử Kiểm kê & Lệch kho</h2>
        <div className="flex items-center gap-[15px]">
            <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input type="text" placeholder="Tìm tên sản phẩm, ghi chú..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                <Plus size={16} /> Tạo phiếu kiểm kê
            </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 border border-slate-200 rounded-xl">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Thời gian</th>
              <th className="px-4 py-3 font-semibold">Sản phẩm</th>
              <th className="px-4 py-3 font-semibold text-center">Lý thuyết</th>
              <th className="px-4 py-3 font-semibold text-center">Thực tế</th>
              <th className="px-4 py-3 font-semibold text-center">Lệch</th>
              <th className="px-4 py-3 font-semibold">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTakes.map(st => (
              <tr key={st.id || st.createdAt} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{new Date(st.createdAt).toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-800">{st.productName}</p>
                  {st.variantName && <p className="text-xs text-indigo-600">{st.variantName}</p>}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">{st.expected}</td>
                <td className="px-4 py-3 text-center font-bold text-slate-800">{st.actual}</td>
                <td className="px-4 py-3 text-center">
                  {st.difference === 0 ? (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-bold">0</span>
                  ) : (
                    <span className={`px-2 py-1 rounded-md font-bold ${st.difference > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {st.difference > 0 ? '+' : ''}{st.difference}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{st.note || '-'}</td>
              </tr>
            ))}
            {filteredTakes.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">Chưa có lịch sử kiểm kê</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && <StockTakeModal />}
    </div>
  );
};

export default StockTakeManager;
