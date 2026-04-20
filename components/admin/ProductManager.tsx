import React, { useState, useMemo } from 'react';
import { BackendContextType, Product, Language, formatCurrency, OrderStatus, Category } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import { api } from '../../services/apiClient';
import ProductForm from './ProductForm';
import ConfirmModal from './ConfirmModal';
import ProductHistoryModal from './ProductHistory';
import CategoryManager from './CategoryManager';
import InventoryManager from './InventoryManager';
import {
  Package, Search, Plus, Filter, Trash2, Edit, Eye, X,
  ChevronLeft, ChevronRight, CheckCircle, Truck, FileText, Printer, AlertTriangle, Download, Upload, MoreVertical, Copy, History, FolderTree, ClipboardList
} from 'lucide-react';

interface ProductManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const ITEMS_PER_PAGE = 10;

const ProductManager: React.FC<ProductManagerProps> = ({ backend, lang }) => {
    const t = TRANSLATIONS[lang];
    const { state, addProduct, updateProduct, deleteProduct } = backend;

    const [mainTab, setMainTab] = useState<'products' | 'categories' | 'inventory'>('products');
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [historyProductId, setHistoryProductId] = useState<string | null>(null);

    // Filter States
    const [productSearch, setProductSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Hidden'>('All');
    const [currentPage, setCurrentPage] = useState(1);

    // Bulk Selection States
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [bulkActionType, setBulkActionType] = useState<'delete' | 'visibility' | 'category' | null>(null);
    const [bulkVisibility, setBulkVisibility] = useState<'show' | 'hide'>('show');
    const [bulkCategory, setBulkCategory] = useState('All');

    // Helper
    const getCategoryName = (id: string) => state.categories.find(c => c.id === id)?.name || id;

    // Filter Logic with Advanced Search
    const filteredProducts = useMemo(() => {
        return state.products.filter(p => {
            const searchTerm = productSearch.toLowerCase();
            
            // Fuzzy search function
            const fuzzyMatch = (text: string, query: string) => {
                if (!query) return true;
                const lowerText = text.toLowerCase();
                let queryIdx = 0;
                let textIdx = 0;
                
                while (queryIdx < query.length && textIdx < lowerText.length) {
                    if (lowerText[textIdx] === query[queryIdx]) {
                        queryIdx++;
                    }
                    textIdx++;
                }
                return queryIdx === query.length;
            };

            // Search in name, SKU, and description
            const matchSearch = !searchTerm ||
                p.name.toLowerCase().includes(searchTerm) ||
                p.sku.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                fuzzyMatch(p.name, searchTerm) ||
                fuzzyMatch(p.sku, searchTerm);

            const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
            const matchStock = stockFilter === 'All' ? true : stockFilter === 'Low' ? p.stock < 10 : !p.isVisible;
            return matchSearch && matchCategory && matchStock;
        });
    }, [state.products, productSearch, selectedCategory, stockFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const displayedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Handlers
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
    };

    const handleClone = async (product: Product) => {
        try {
            await api.cloneProduct(product.id);
        } catch (error) {
            console.error('Error cloning product:', error);
            // Fallback to local clone
            const generateId = () => `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const clonedProduct: Omit<Product, 'id'> = {
                ...product,
                name: `${product.name} (Copy)`,
                sku: `${product.sku}-COPY-${Date.now().toString().substr(-4)}`,
                stock: 0,
                isVisible: false,
                variants: product.variants.map(v => ({
                    ...v,
                    id: generateId(),
                    stock: 0
                }))
            };
            addProduct(clonedProduct);
        }
    };

    // Bulk Selection Handlers
    const handleSelectProduct = (productId: string) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedProducts.size === displayedProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(displayedProducts.map(p => p.id)));
        }
    };

    // Bulk Action Handlers
    const handleBulkDelete = async () => {
        try {
            await api.bulkDeleteProducts(Array.from(selectedProducts));
            selectedProducts.forEach(id => deleteProduct(id));
        } catch (error) {
            console.error('Error bulk deleting products:', error);
        }
        setSelectedProducts(new Set());
        setShowBulkActions(false);
    };

    const handleBulkVisibility = async () => {
        try {
            await api.bulkVisibilityProducts(Array.from(selectedProducts), bulkVisibility === 'show');
            selectedProducts.forEach(id => {
                updateProduct(id, { isVisible: bulkVisibility === 'show' });
            });
        } catch (error) {
            console.error('Error bulk updating visibility:', error);
        }
        setSelectedProducts(new Set());
        setShowBulkActions(false);
    };

    const handleBulkCategory = async () => {
        try {
            await api.bulkCategoryProducts(Array.from(selectedProducts), bulkCategory);
            selectedProducts.forEach(id => {
                updateProduct(id, { category: bulkCategory });
            });
        } catch (error) {
            console.error('Error bulk updating category:', error);
        }
        setSelectedProducts(new Set());
        setShowBulkActions(false);
    };

    // CSV Export
    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        const bom = "\uFEFF";
        csvContent += bom;

        const headers = ["ID", "Name", "SKU", "Category", "Price", "Cost Price", "Stock", "Visibility", "Description"];
        csvContent += headers.join(",") + "\n";

        state.products.forEach(p => {
            const row = [
                p.id,
                `"${p.name.replace(/"/g, '""')}"`,
                p.sku,
                getCategoryName(p.category),
                p.price,
                p.costPrice || 0,
                p.stock,
                p.isVisible ? 'Visible' : 'Hidden',
                `"${p.description.replace(/"/g, '""')}"`
            ];
            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CSV Import
    const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').slice(1); // Skip header

            lines.forEach(line => {
                if (!line.trim()) return;

                // Simple CSV parsing (assuming no commas in values for simplicity)
                const values = line.split(',');
                if (values.length >= 5) {
                    const product = {
                        id: crypto.randomUUID(),
                        name: values[1].replace(/"/g, ''),
                        sku: values[2],
                        category: state.categories.find(c => c.name === values[3])?.id || state.categories[0]?.id || '',
                        price: parseFloat(values[4]) || 0,
                        costPrice: parseFloat(values[5]) || 0,
                        stock: parseInt(values[6]) || 0,
                        isVisible: values[7] === 'Visible',
                        description: values[8]?.replace(/"/g, '') || '',
                        images: ['https://via.placeholder.com/300'],
                        hasVariants: false,
                        variants: [],
                        discount: 0,
                        discountType: 'PERCENT' as const
                    };
                    addProduct(product);
                }
            });
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    };

    const ProductDetailModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
                <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="text-indigo-600" /> {t.productDetails}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <div className="flex flex-col md:flex-row gap-[15px]">
                            <div className="w-full md:w-1/3 space-y-[15px]">
                                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.slice(1).map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100">
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full md:w-2/3 space-y-[15px]">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                            {getCategoryName(product.category)}
                                        </span>
                                        {!product.isVisible && <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{t.hiddenLabel}</span>}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1 font-mono">{t.skuLabel}: {product.sku}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-[15px] bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-bold">{t.price}</span>
                                        <p className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-bold">{t.stock}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className={`w-2.5 h-2.5 rounded-full ${product.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                            <span className="text-lg font-bold text-slate-800">{product.stock}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 mb-2">{t.description}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
                                </div>

                                {product.hasVariants && (
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">{t.variants}</h4>
                                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                                    <tr>
                                                        <th className="px-3 py-2">{t.variantLabel}</th>
                                                        <th className="px-3 py-2">{t.price}</th>
                                                        <th className="px-3 py-2">{t.stock}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {product.variants.map(v => (
                                                        <tr key={v.id}>
                                                            <td className="px-3 py-2 font-medium">{v.name}</td>
                                                            <td className="px-3 py-2">{formatCurrency(v.price)}</td>
                                                            <td className="px-3 py-2">{v.stock}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                        >
                            {t.closeBtn}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (isAddingProduct) {
        return <ProductForm onSubmit={(data) => { addProduct(data); setIsAddingProduct(false); }} onCancel={() => setIsAddingProduct(false)} lang={lang} />;
    }

    if (editingProduct) {
        return <ProductForm initialData={editingProduct} onSubmit={(data) => { updateProduct(editingProduct.id, data); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} lang={lang} />;
    }

    return (
        <div className="space-y-[15px] max-w-7xl mx-auto animate-fade-in-up">
            {/* Main Tab Switcher */}
            <div className="flex gap-2 border-b border-slate-200">
              <button
                onClick={() => setMainTab('products')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  mainTab === 'products'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package size={18} /> Sản Phẩm
                </div>
              </button>
              <button
                onClick={() => setMainTab('categories')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  mainTab === 'categories'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderTree size={18} /> Danh Mục
                </div>
              </button>
              <button
                onClick={() => setMainTab('inventory')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  mainTab === 'inventory'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} /> Kho Hàng
                </div>
              </button>
            </div>

            {/* Products Tab */}
            {mainTab === 'products' && (
            <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[15px]">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t.productMgmt}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t.manageCatalog}</p>
                </div>
                <button
                    onClick={() => setIsAddingProduct(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-medium active:scale-95"
                >
                    <Plus size={18} />
                    {t.addProduct}
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-[15px] justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, SKU, mô tả..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={productSearch}
                        onChange={(e) => { setProductSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <select
                        className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50 w-full sm:w-auto"
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">{t.allCategories}</option>
                        {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                        className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50 w-full sm:w-auto"
                        value={stockFilter}
                        onChange={(e) => { setStockFilter(e.target.value as any); setCurrentPage(1); }}
                    >
                        <option value="All">{t.allStatus}</option>
                        <option value="Low">{t.lowStock}</option>
                        <option value="Hidden">{t.hidden}</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                            title="Export CSV"
                        >
                            <Download size={16} />
                        </button>
                        <label className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer">
                            <Upload size={16} />
                            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                        </label>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedProducts.size > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-[15px]">
                        <span className="text-sm font-bold text-indigo-900">{selectedProducts.size} selected</span>
                        <button
                            onClick={() => setSelectedProducts(new Set())}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Clear selection
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setBulkActionType('visibility')}
                            className="px-4 py-2 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                            Update Visibility
                        </button>
                        <button
                            onClick={() => setBulkActionType('category')}
                            className="px-4 py-2 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                            Update Category
                        </button>
                        <button
                            onClick={() => setBulkActionType('delete')}
                            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
                        >
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Action Modal */}
            {bulkActionType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setBulkActionType(null)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            {bulkActionType === 'delete' ? 'Delete Selected Products' :
                             bulkActionType === 'visibility' ? 'Update Visibility' :
                             'Update Category'}
                        </h3>
                        {bulkActionType === 'visibility' && (
                            <div className="space-y-[15px]">
                                <div className="flex gap-[15px]">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value="show"
                                            checked={bulkVisibility === 'show'}
                                            onChange={() => setBulkVisibility('show')}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <span>Show</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value="hide"
                                            checked={bulkVisibility === 'hide'}
                                            onChange={() => setBulkVisibility('hide')}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <span>Hide</span>
                                    </label>
                                </div>
                            </div>
                        )}
                        {bulkActionType === 'category' && (
                            <div className="space-y-[15px]">
                                <select
                                    value={bulkCategory}
                                    onChange={(e) => setBulkCategory(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                >
                                    <option value="">Select category...</option>
                                    {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                        {bulkActionType === 'delete' && (
                            <p className="text-slate-600">Are you sure you want to delete {selectedProducts.size} selected products? This action cannot be undone.</p>
                        )}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setBulkActionType(null)}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (bulkActionType === 'delete') handleBulkDelete();
                                    else if (bulkActionType === 'visibility') handleBulkVisibility();
                                    else if (bulkActionType === 'category') handleBulkCategory();
                                }}
                                disabled={bulkActionType === 'category' && !bulkCategory}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.size === displayedProducts.length && displayedProducts.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">{t.productLabel || 'Product'}</th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">{t.category}</th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">{t.price}</th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-center">{t.stock}</th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">{t.actionsLabel}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedProducts.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => handleSelectProduct(product.id)}
                                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-[15px]">
                                            <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                                <img src={product.images[0]} className="w-full h-full object-cover" />
                                                {!product.isVisible && <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center"><Eye size={16} className="text-white"/></div>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                            {getCategoryName(product.category)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-bold text-sm text-slate-900">{formatCurrency(product.price)}</p>
                                        {product.costPrice > 0 && <p className="text-[10px] text-slate-400">{t.costLabel} {formatCurrency(product.costPrice)}</p>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock < 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => setViewingProduct(product)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye size={18}/></button>
                                            <button onClick={() => setHistoryProductId(product.id)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Product History"><History size={18}/></button>
                                            <button onClick={() => handleClone(product)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Clone Product"><Copy size={18}/></button>
                                            <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18}/></button>
                                            <button onClick={() => setDeletingProductId(product.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <Package size={48} className="mx-auto mb-3 opacity-20"/>
                                        <p>{t.noProductsFound}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-[15px] bg-slate-50">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200 transition-all w-full sm:w-auto"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-medium text-slate-600">{t.pageXOfY.replace('{current}', currentPage.toString()).replace('{total}', totalPages.toString())}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200 transition-all w-full sm:w-auto"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {viewingProduct && <ProductDetailModal product={viewingProduct} onClose={() => setViewingProduct(null)} />}

            {historyProductId && (
                <ProductHistoryModal
                    history={backend.productHistory}
                    lang={lang}
                    onClose={() => setHistoryProductId(null)}
                />
            )}

            <ConfirmModal
                isOpen={!!deletingProductId}
                onClose={() => setDeletingProductId(null)}
                onConfirm={() => {
                    if (deletingProductId) {
                        deleteProduct(deletingProductId);
                    }
                }}
                title={t.confirmDelete || 'Confirm Delete'}
                message={t.deleteConfirmMessage || 'Are you sure you want to delete this item? This action cannot be undone.'}
                lang={lang}
            />
            </>
            )}

            {/* Categories Tab */}
            {mainTab === 'categories' && (
            <>
            <CategoryManager backend={backend} lang={lang} />
            </>
            )}

            {/* Inventory Tab */}
            {mainTab === 'inventory' && (
            <>
            <InventoryManager backend={backend} lang={lang} />
            </>
            )}
        </div>
    );
};

export default ProductManager;
