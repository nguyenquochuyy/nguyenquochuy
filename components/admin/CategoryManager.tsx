import React, { useState } from 'react';
import { BackendContextType, Category, Language, Product, formatCurrency } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import ConfirmModal from './ConfirmModal';
import { 
  FolderTree, Plus, Edit, Trash2, ChevronRight, ChevronDown, Layers, 
  Eye, Package, Box, TrendingUp, X 
} from 'lucide-react';

interface CategoryManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, addCategory, updateCategory, deleteCategory } = backend;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    parentId: undefined,
    order: 0
  });

  const resetForm = () => {
    setFormData({ name: '', parentId: undefined, order: 0 });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      parentId: category.parentId,
      order: category.order
    });
    setEditingId(category.id);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCategory(editingId, formData);
    } else {
      addCategory(formData);
    }
    resetForm();
  };

  // Helper calculations
  const getProductCount = (catId: string) => state.products.filter(p => p.category === catId).length;
  
  const getInventoryValue = (catId: string) => state.products
    .filter(p => p.category === catId)
    .reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Organize Categories into Tree
  const rootCategories = state.categories
    .filter(c => !c.parentId)
    .sort((a, b) => a.order - b.order);

  const getChildren = (parentId: string) => {
    return state.categories
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  // --- Sub-component: Detail Modal ---
  const CategoryDetailModal = ({ category, onClose }: { category: Category, onClose: () => void }) => {
    const products = state.products.filter(p => p.category === category.id);
    const totalValue = getInventoryValue(category.id);
    const parentName = category.parentId ? state.categories.find(c => c.id === category.parentId)?.name : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
          
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                   <FolderTree size={20} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                   <p className="text-xs text-gray-500 font-medium">
                      {parentName ? `${t.subCategory} of ${parentName}` : t.topLevel}
                   </p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
               <X size={20} />
             </button>
          </div>

          <div className="p-6 overflow-y-auto">
             {/* Stats Cards */}
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Box size={18} />
                      <span className="text-xs font-bold uppercase tracking-wide">{t.productCount}</span>
                   </div>
                   <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                   <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <TrendingUp size={18} />
                      <span className="text-xs font-bold uppercase tracking-wide">{t.inventoryValue}</span>
                   </div>
                   <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                </div>
             </div>

             {/* Product List */}
             <div>
                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <Package size={16} /> {t.associatedProducts}
                </h4>
                {products.length === 0 ? (
                   <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                      <Package size={32} className="mx-auto mb-2 opacity-30"/>
                      <p className="text-sm">{t.noProductsInCategory}</p>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {products.map(p => (
                         <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-indigo-200 transition-colors group">
                            <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                            <div className="min-w-0">
                               <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                               <p className="text-xs text-gray-500">{formatCurrency(p.price)} • Stock: {p.stock}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
             <button onClick={onClose} className="px-5 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 shadow-sm transition-colors">
                Close
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h2 className="text-2xl font-bold text-slate-900">{t.categoryMgmt}</h2>
              <p className="text-slate-500 text-sm mt-1">{state.categories.length} categories defined • {state.products.length} products assigned</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-medium active:scale-95"
          >
            <Plus size={18} />
            {t.addCategory}
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Category Tree */}
          <div className="lg:col-span-2 space-y-4">
             {state.categories.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border-2 border-dashed border-slate-200">
                   <FolderTree size={48} className="mx-auto mb-3 opacity-20" />
                   <p className="text-lg font-medium">No categories yet.</p>
                   <p className="text-sm">Start by adding your first category.</p>
                </div>
             ) : (
                rootCategories.map(root => (
                   <div key={root.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Root Category Row */}
                      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-50">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-100">
                               {root.order}
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                  {root.name}
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                                    {getProductCount(root.id)} Items
                                  </span>
                               </h3>
                               <p className="text-xs text-slate-400 font-medium mt-0.5">{t.topLevel}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-1">
                            <button onClick={() => setViewingCategory(root)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t.viewDetails}><Eye size={18}/></button>
                            <button onClick={() => handleEdit(root)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title={t.editCategory}><Edit size={18}/></button>
                            <button onClick={() => setDeletingCategoryId(root.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title={t.delete}><Trash2 size={18}/></button>
                         </div>
                      </div>
                      
                      {/* Children Rows */}
                      <div className="bg-slate-50/50">
                         {getChildren(root.id).map(child => (
                            <div key={child.id} className="flex items-center justify-between p-3 pl-10 border-t border-slate-100 hover:bg-slate-50 transition-colors group">
                               <div className="flex items-center gap-3 relative">
                                  {/* Connector Line */}
                                  <div className="absolute -left-6 top-1/2 w-4 h-px bg-slate-300"></div>
                                  <div className="absolute -left-6 top-0 bottom-1/2 w-px bg-slate-300"></div>
                                  
                                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shadow-sm">
                                     {child.order}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                       {child.name}
                                       <span className="text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">
                                          {getProductCount(child.id)}
                                       </span>
                                    </h4>
                                  </div>
                               </div>
                               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setViewingCategory(child)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title={t.viewDetails}><Eye size={16}/></button>
                                  <button onClick={() => handleEdit(child)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title={t.editCategory}><Edit size={16}/></button>
                                  <button onClick={() => setDeletingCategoryId(child.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title={t.delete}><Trash2 size={16}/></button>
                               </div>
                            </div>
                         ))}
                         {getChildren(root.id).length === 0 && (
                            <div className="p-3 pl-12 text-xs text-slate-400 italic">No sub-categories</div>
                         )}
                      </div>
                   </div>
                ))
             )}
          </div>

          {/* Side Panel: Form */}
          <div className="lg:col-span-1">
             {isEditing ? (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-6">
                   <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                      {editingId ? <Edit size={20} className="text-indigo-600"/> : <Plus size={20} className="text-indigo-600"/>}
                      {editingId ? t.editCategory : t.addCategory}
                   </h3>
                   
                   <div className="space-y-5">
                      {/* Name Input */}
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.name}</label>
                         <input 
                           type="text" 
                           required
                           className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                           placeholder="e.g. Summer Collection"
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                         />
                      </div>

                      {/* Parent Category Visual Selection */}
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">{t.categoryLevel}</label>
                         <div className="grid grid-cols-2 gap-3 mb-3">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, parentId: undefined})}
                                className={`flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-xl border-2 transition-all ${
                                    !formData.parentId 
                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-md transform scale-[1.02]' 
                                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                                }`}
                            >
                                <div className={`p-2 rounded-full ${!formData.parentId ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                   <FolderTree size={20} className={!formData.parentId ? 'text-indigo-600' : 'text-slate-400'} />
                                </div>
                                <span className="text-xs font-bold text-center">{t.topLevel}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!formData.parentId) {
                                        const firstParent = state.categories.find(c => !c.parentId && c.id !== editingId);
                                        if (firstParent) setFormData({...formData, parentId: firstParent.id});
                                        else alert("Create a Top Level category first!");
                                    }
                                }}
                                className={`flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-xl border-2 transition-all ${
                                    formData.parentId 
                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-md transform scale-[1.02]' 
                                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                                }`}
                            >
                                <div className={`p-2 rounded-full ${formData.parentId ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                   <Layers size={20} className={formData.parentId ? 'text-indigo-600' : 'text-slate-400'} />
                                </div>
                                <span className="text-xs font-bold text-center">{t.subCategory}</span>
                            </button>
                         </div>

                         {/* Parent Dropdown (Conditional) */}
                         {formData.parentId && (
                             <div className="animate-fade-in p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{t.selectParent}</label>
                                <div className="relative">
                                    <select 
                                    className="w-full pl-4 pr-10 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer font-medium shadow-sm"
                                    value={formData.parentId || ''}
                                    onChange={e => setFormData({...formData, parentId: e.target.value})}
                                    >
                                        {state.categories
                                            .filter(c => !c.parentId && c.id !== editingId)
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                                </div>
                             </div>
                         )}
                      </div>

                      {/* Order Input */}
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.displayOrder}</label>
                         <input 
                           type="number" 
                           className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                           value={formData.order}
                           onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                         />
                      </div>
                   </div>

                   <div className="flex gap-3 mt-8 pt-4 border-t border-slate-50">
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                      >
                         {t.cancel}
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-lg shadow-indigo-100"
                      >
                         {t.save}
                      </button>
                   </div>
                </form>
             ) : (
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 border border-indigo-100 text-center sticky top-6">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-indigo-500">
                        <FolderTree size={32} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Category Management</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        Select "Add Category" or edit an existing one to organize your store's structure efficiently.
                    </p>
                    <button 
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="w-full py-2.5 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                        Start Adding
                    </button>
                </div>
             )}
          </div>
       </div>

       {/* Detail Modal */}
       {viewingCategory && (
           <CategoryDetailModal category={viewingCategory} onClose={() => setViewingCategory(null)} />
       )}

       <ConfirmModal
            isOpen={!!deletingCategoryId}
            onClose={() => setDeletingCategoryId(null)}
            onConfirm={() => {
                if (deletingCategoryId) {
                    deleteCategory(deletingCategoryId);
                }
            }}
            title="Xác nhận xóa danh mục"
            message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
            lang={lang}
        />
    </div>
  );
};

export default CategoryManager;