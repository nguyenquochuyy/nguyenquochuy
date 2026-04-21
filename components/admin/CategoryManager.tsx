import React, { useState } from 'react';
import { BackendContextType, Category, Language, Product, formatCurrency } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import ConfirmModal from './ConfirmModal';
import { api } from '../../services/apiClient';
import {
  FolderTree, Plus, Edit, Trash2, ChevronRight, ChevronDown, Layers,
  Eye, Package, Box, TrendingUp, X, Check, MoveUp, MoveDown,
  Search, Power, ToggleLeft, ToggleRight, FileText
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkReorderModal, setShowBulkReorderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Form State
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    description: '',
    parentId: undefined,
    order: 0,
    isActive: true,
    image: undefined,
    banner: undefined,
    metaTitle: undefined,
    metaDescription: undefined,
    slug: undefined
  });

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCategories.size === filteredCategories.length && filteredCategories.length > 0) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(filteredCategories.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.bulkDeleteCategories(Array.from(selectedCategories));
      // Update local state
      selectedCategories.forEach(id => deleteCategory(id));
      setSelectedCategories(new Set());
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Error bulk deleting categories:', error);
    }
  };

  const handleBulkReorder = async (direction: 'up' | 'down') => {
    const selected = Array.from(selectedCategories);
    const categories = [...state.categories];
    const updates: { id: string; order: number }[] = [];

    selected.forEach(id => {
      const index = categories.findIndex(c => c.id === id);
      if (index === -1) return;

      const category = categories[index];
      if (direction === 'up' && index > 0) {
        // Swap with previous category at same level
        const prevIndex = index - 1;
        const prevCategory = categories[prevIndex];
        if (prevCategory.parentId === category.parentId) {
          const tempOrder = category.order;
          category.order = prevCategory.order;
          prevCategory.order = tempOrder;
          updates.push({ id: category.id, order: category.order });
          updates.push({ id: prevCategory.id, order: prevCategory.order });
          updateCategory(category.id, { order: category.order });
          updateCategory(prevCategory.id, { order: prevCategory.order });
        }
      } else if (direction === 'down' && index < categories.length - 1) {
        // Swap with next category at same level
        const nextIndex = index + 1;
        const nextCategory = categories[nextIndex];
        if (nextCategory.parentId === category.parentId) {
          const tempOrder = category.order;
          category.order = nextCategory.order;
          nextCategory.order = tempOrder;
          updates.push({ id: category.id, order: category.order });
          updates.push({ id: nextCategory.id, order: nextCategory.order });
          updateCategory(category.id, { order: category.order });
          updateCategory(nextCategory.id, { order: nextCategory.order });
        }
      }
    });

    // Call API to persist changes
    if (updates.length > 0) {
      try {
        await api.bulkReorderCategories(updates);
      } catch (error) {
        console.error('Error bulk reordering categories:', error);
      }
    }

    setSelectedCategories(new Set());
    setShowBulkReorderModal(false);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: undefined, order: 0, isActive: true, image: undefined, banner: undefined, metaTitle: undefined, metaDescription: undefined, slug: undefined });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId,
      order: category.order,
      isActive: category.isActive !== false,
      image: category.image,
      banner: category.banner,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      slug: category.slug
    });
    setEditingId(category.id);
    setIsEditing(true);
  };

  const handleToggleActive = async (categoryId: string) => {
    try {
      await api.toggleCategoryActive(categoryId);
    } catch (error) {
      console.error('Error toggling category active:', error);
    }
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

  // Filter categories by search and active status
  const filteredCategories = state.categories.filter(c => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterActive === 'active' && c.isActive === false) return false;
    if (filterActive === 'inactive' && c.isActive !== false) return false;
    return true;
  });

  // Organize Categories into Tree
  const rootCategories = filteredCategories
    .filter(c => !c.parentId)
    .sort((a, b) => a.order - b.order);

  const getChildren = (parentId: string) => {
    return filteredCategories
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  // Recursive Tree Item Component
  const CategoryTreeItem: React.FC<{ category: Category; level: number }> = ({ category, level }) => {
    const children = getChildren(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = children.length > 0;
    const isDragging = draggedCategoryId === category.id;

    const handleDragStart = (e: React.DragEvent) => {
      setDraggedCategoryId(category.id);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
      setDraggedCategoryId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!draggedCategoryId || draggedCategoryId === targetId) return;

      const draggedCategory = state.categories.find(c => c.id === draggedCategoryId);
      const targetCategory = state.categories.find(c => c.id === targetId);

      if (draggedCategory && targetCategory) {
        // Don't allow dropping a parent into its own child
        if (isDescendant(draggedCategoryId, targetId)) return;

        // Update the dragged category to be a child of the target
        const siblings = getChildren(targetCategory.id);
        const newOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) + 1 : 0;

        updateCategory(draggedCategoryId, {
          parentId: targetCategory.id,
          order: newOrder
        });

        // Auto-expand the target category
        setExpandedCategories(prev => new Set([...prev, targetId]));
      }

      setDraggedCategoryId(null);
    };

    const isDescendant = (parentId: string, childId: string): boolean => {
      const children = getChildren(childId);
      if (children.some(c => c.id === parentId)) return true;
      return children.some(c => isDescendant(parentId, c.id));
    };

    return (
      <div>
        {/* Category Row */}
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, category.id)}
          className={`flex items-center justify-between p-3 border-t border-slate-100 hover:bg-slate-50 transition-colors group ${
            level > 0 ? 'pl-6' : ''
          } ${isDragging ? 'opacity-50 bg-indigo-50' : ''} ${selectedCategories.has(category.id) ? 'bg-indigo-50' : ''}`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Checkbox */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleSelectCategory(category.id); }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                selectedCategories.has(category.id)
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-300 hover:border-indigo-400 text-transparent'
              }`}
            >
              {selectedCategories.has(category.id) && <Check size={12} />}
            </button>

            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(category.id); }}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {!hasChildren && <div className="w-8" />}

            {/* Category Info */}
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shadow-sm">
                {category.order}
              </div>
            )}
            <div className="flex-1">
              <h4 className={`text-sm font-semibold flex items-center gap-2 ${category.isActive === false ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {category.name}
                <span className="text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">
                  {getProductCount(category.id)} sp
                </span>
                {category.isActive === false && (
                  <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-medium">
                    Ẩn
                  </span>
                )}
              </h4>
              {category.description && (
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[300px]">{category.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleToggleActive(category.id)} className={`p-1.5 rounded-lg ${category.isActive === false ? 'text-rose-400 hover:text-green-600 hover:bg-green-50' : 'text-green-500 hover:text-rose-600 hover:bg-rose-50'}`} title={category.isActive === false ? 'Kích hoạt' : 'Ẩn'}>
              {category.isActive === false ? <ToggleLeft size={16}/> : <ToggleRight size={16}/>}
            </button>
            <button onClick={() => setViewingCategory(category)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title={t.viewDetails}><Eye size={16}/></button>
            <button onClick={() => handleEdit(category)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title={t.editCategory}><Edit size={16}/></button>
            <button onClick={() => setDeletingCategoryId(category.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title={t.delete}><Trash2 size={16}/></button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="bg-slate-50/30">
            {children.map(child => (
              <CategoryTreeItem key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- Sub-component: Detail Modal ---
  const CategoryDetailModal = ({ category, onClose }: { category: Category, onClose: () => void }) => {
    const products = state.products.filter(p => p.category === category.id);
    const totalValue = getInventoryValue(category.id);
    const parentName = category.parentId ? state.categories.find(c => c.id === category.parentId)?.name : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
        <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg relative overflow-hidden flex flex-col max-h-[85vh]">

          {/* Banner */}
          {category.banner && (
            <div className="relative h-48 overflow-hidden">
              <img src={category.banner} alt={category.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
             <div className="flex items-center gap-3">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <FolderTree size={20} />
                  </div>
                )}
                <div>
                   <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                     {category.name}
                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${category.isActive === false ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'}`}>
                       {category.isActive === false ? 'Đã ẩn' : 'Hoạt động'}
                     </span>
                   </h3>
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
             {/* Description */}
             {category.description && (
               <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                 <p className="text-xs font-medium text-gray-500 mb-1">Mô tả</p>
                 <p className="text-sm text-gray-700">{category.description}</p>
               </div>
             )}

             {/* Stats Cards */}
             <div className="grid grid-cols-2 gap-[15px] mb-8">
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

             {/* SEO Section */}
             <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                   SEO Settings
                </h4>
                <div className="space-y-3">
                   {category.metaTitle && (
                      <div>
                         <p className="text-xs font-medium text-gray-500 mb-1">Meta Title</p>
                         <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">{category.metaTitle}</p>
                      </div>
                   )}
                   {category.metaDescription && (
                      <div>
                         <p className="text-xs font-medium text-gray-500 mb-1">Meta Description</p>
                         <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">{category.metaDescription}</p>
                      </div>
                   )}
                   {category.slug && (
                      <div>
                         <p className="text-xs font-medium text-gray-500 mb-1">URL Slug</p>
                         <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg font-mono">{category.slug}</p>
                      </div>
                   )}
                   {!category.metaTitle && !category.metaDescription && !category.slug && (
                      <p className="text-sm text-gray-400 italic">No SEO settings configured</p>
                   )}
                </div>
             </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
             <button onClick={onClose} className="px-5 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 shadow-sm transition-colors">
                {t.closeBtn}
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-[15px] animate-fade-in-up">
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[15px]">
          <div>
              <h2 className="text-2xl font-bold text-slate-900">{t.categoryMgmt}</h2>
              <p className="text-slate-500 text-sm mt-1">{state.categories.length} {t.categoriesSubtitle} • {state.products.length} {t.productsAssigned}</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-medium active:scale-95"
          >
            <Plus size={18} />
            {t.addCategory}
          </button>
       </div>

       {/* Search & Filter Bar */}
       <div className="flex flex-col sm:flex-row gap-3">
         <div className="relative flex-1">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input
             type="text"
             placeholder="Tìm kiếm danh mục..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
           />
         </div>
         <div className="flex gap-2">
           {(['all', 'active', 'inactive'] as const).map(status => (
             <button
               key={status}
               onClick={() => setFilterActive(status)}
               className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                 filterActive === status
                   ? 'bg-indigo-600 text-white shadow-md'
                   : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
               }`}
             >
               {status === 'all' ? 'Tất cả' : status === 'active' ? 'Đang hoạt động' : 'Đã ẩn'}
             </button>
           ))}
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-[15px]">
          {/* Main Content: Category List */}
          <div className="lg:col-span-2">
             <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                   <div className="flex items-center justify-between">
                     <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                           <FolderTree size={20} />
                        </div>
                        {t.categoryMgmt}
                        <span className="ml-2 text-sm font-normal text-slate-500">
                           {filteredCategories.length}/{state.categories.length} {t.categoriesSubtitle}
                        </span>
                     </h2>
                     <button
                       onClick={toggleSelectAll}
                       className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                         selectedCategories.size === filteredCategories.length && filteredCategories.length > 0
                           ? 'bg-indigo-100 text-indigo-700'
                           : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                       }`}
                     >
                       {selectedCategories.size === filteredCategories.length && filteredCategories.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                     </button>
                   </div>
                </div>

                {/* Bulk Action Toolbar */}
                {selectedCategories.size > 0 && (
                  <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3 animate-fade-in">
                    <span className="text-sm font-medium text-indigo-700">
                      {selectedCategories.size} danh mục đã chọn
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => setShowBulkReorderModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        <MoveUp size={14} />
                        Di chuyển
                      </button>
                      <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 border border-rose-600 rounded-lg text-white hover:bg-rose-700 text-sm font-medium transition-colors"
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                   {state.categories.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                         <FolderTree size={48} className="mx-auto mb-3 opacity-20" />
                         <p className="text-sm font-medium">{t.noCategoriesYet}</p>
                         <p className="text-xs mt-1">{t.startAdding}</p>
                      </div>
                   ) : (
                      rootCategories.map(root => (
                        <CategoryTreeItem key={root.id} category={root} level={0} />
                      ))
                   )}
                </div>
             </div>
          </div>

          {/* Side Panel: Form */}
          <div className="lg:col-span-1">
             {isEditing ? (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-6">
                   <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                      {editingId ? <Edit size={20} className="text-indigo-600"/> : <Plus size={20} className="text-indigo-600"/>}
                      {editingId ? t.editCategory : t.addCategory}
                   </h3>

                   <div className="space-y-[15px]">
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

                      {/* Description */}
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
                         <textarea
                           className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm resize-none"
                           placeholder="Mô tả ngắn gọn về danh mục..."
                           rows={3}
                           value={formData.description || ''}
                           onChange={e => setFormData({...formData, description: e.target.value})}
                         />
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                         <div>
                           <p className="text-sm font-medium text-slate-700">Trạng thái</p>
                           <p className="text-xs text-slate-400">Danh mục {formData.isActive !== false ? 'đang hoạt động' : 'đã ẩn'}</p>
                         </div>
                         <button
                           type="button"
                           onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                           className={`relative w-11 h-6 rounded-full transition-colors ${formData.isActive !== false ? 'bg-green-500' : 'bg-slate-300'}`}
                         >
                           <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${formData.isActive !== false ? 'translate-x-5' : ''}`} />
                         </button>
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

                      {/* Category Image */}
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Image</label>
                         <input
                           type="text"
                           className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                           placeholder="https://example.com/image.jpg"
                           value={formData.image || ''}
                           onChange={e => setFormData({...formData, image: e.target.value})}
                         />
                         {formData.image && (
                           <img src={formData.image} alt="Category" className="mt-2 w-24 h-24 object-cover rounded-lg border border-slate-200" />
                         )}
                      </div>

                      {/* Category Banner */}
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Banner</label>
                         <input
                           type="text"
                           className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                           placeholder="https://example.com/banner.jpg"
                           value={formData.banner || ''}
                           onChange={e => setFormData({...formData, banner: e.target.value})}
                         />
                         {formData.banner && (
                           <img src={formData.banner} alt="Banner" className="mt-2 w-full h-32 object-cover rounded-lg border border-slate-200" />
                         )}
                      </div>

                      {/* SEO Section */}
                      <div className="pt-4 border-t border-slate-200">
                         <h4 className="text-sm font-bold text-slate-700 mb-3">SEO Settings</h4>

                         {/* Meta Title */}
                         <div className="mb-3">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                              placeholder="Tiêu đề SEO cho công cụ tìm kiếm"
                              value={formData.metaTitle || ''}
                              onChange={e => setFormData({...formData, metaTitle: e.target.value})}
                            />
                         </div>

                         {/* Meta Description */}
                         <div className="mb-3">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
                            <textarea
                              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                              placeholder="Mô tả SEO cho công cụ tìm kiếm"
                              rows={3}
                              value={formData.metaDescription || ''}
                              onChange={e => setFormData({...formData, metaDescription: e.target.value})}
                            />
                         </div>

                         {/* URL Slug */}
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">URL Slug</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                              placeholder="category-url-slug"
                              value={formData.slug || ''}
                              onChange={e => setFormData({...formData, slug: e.target.value})}
                            />
                         </div>
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
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-8 border border-indigo-100 text-center sticky top-6">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-indigo-500">
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

        {/* Bulk Delete Modal */}
        <ConfirmModal
            isOpen={showBulkDeleteModal}
            onClose={() => setShowBulkDeleteModal(false)}
            onConfirm={handleBulkDelete}
            title="Xác nhận xóa hàng loạt"
            message={`Bạn có chắc chắn muốn xóa ${selectedCategories.size} danh mục đã chọn? Hành động này không thể hoàn tác.`}
            lang={lang}
        />

        {/* Bulk Reorder Modal */}
        {showBulkReorderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowBulkReorderModal(false)}></div>
            <div className="bg-white rounded-xl w-full max-w-md shadow-lg relative overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Di chuyển danh mục</h3>
                <p className="text-sm text-slate-500 mt-1">Chọn hướng di chuyển cho {selectedCategories.size} danh mục</p>
              </div>
              <div className="p-6 flex gap-3">
                <button
                  onClick={() => handleBulkReorder('up')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors"
                >
                  <MoveUp size={18} />
                  Lên trên
                </button>
                <button
                  onClick={() => handleBulkReorder('down')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 font-medium transition-colors"
                >
                  <MoveDown size={18} />
                  Xuống dưới
                </button>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowBulkReorderModal(false)}
                  className="px-5 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 shadow-sm transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default CategoryManager;
