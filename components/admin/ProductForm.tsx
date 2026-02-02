import React, { useState, useEffect, useRef } from 'react';
import { Product, Language, ProductVariant, Category } from '../../types';
import { loadState } from '../../services/mockBackend';
import { generateProductDescription } from '../../services/gemini';
import { TRANSLATIONS } from '../../services/translations';
import { Loader2, Sparkles, X, Plus, Trash2, Image as ImageIcon, Check, Box, DollarSign, List, Tag, Upload, Star } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface ProductFormProps {
  onSubmit: (data: Omit<Product, 'id'>) => void;
  onCancel: () => void;
  initialData?: Product;
  lang: Language;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel, initialData, lang }) => {
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
     const state = loadState();
     setCategories(state.categories.sort((a,b) => a.order - b.order));
  }, []);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: initialData?.name || '',
    category: initialData?.category || '',
    price: initialData?.price || 0,
    costPrice: initialData?.costPrice || 0,
    discount: initialData?.discount || 0,
    discountType: initialData?.discountType || 'PERCENT',
    stock: initialData?.stock || 0,
    sku: initialData?.sku || '',
    description: initialData?.description || '',
    images: initialData?.images?.length ? initialData.images : [''],
    isVisible: initialData?.isVisible ?? true,
    hasVariants: initialData?.hasVariants || false,
    variants: initialData?.variants || []
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [confirmRemoveImageIndex, setConfirmRemoveImageIndex] = useState<number | null>(null);
  const [confirmRemoveVariantIndex, setConfirmRemoveVariantIndex] = useState<number | null>(null);

  useEffect(() => {
     if (categories.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categories[0].id }));
     }
  }, [categories]);

  useEffect(() => {
    if (formData.hasVariants) {
      const totalStock = formData.variants.reduce((sum, v) => sum + v.stock, 0);
      setFormData(prev => ({ ...prev, stock: totalStock }));
    }
  }, [formData.variants, formData.hasVariants]);

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    const catName = categories.find(c => c.id === formData.category)?.name || 'General';
    const desc = await generateProductDescription(formData.name, catName, lang);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images.filter(i => i), newImageUrl] }));
      setNewImageUrl('');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      // FIX: Added explicit 'File' type annotation to resolve a potential type inference issue.
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images.filter(i => i), reader.result as string]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setConfirmRemoveImageIndex(index);
  };

  const handleSetMainImage = (index: number) => {
    const newImages = [...formData.images];
    const selectedImage = newImages[index];
    newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `v_${Date.now()}`,
      name: '',
      sku: `${formData.sku}-VAR`,
      price: formData.price,
      stock: 0
    };
    setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const removeVariant = (index: number) => {
    setConfirmRemoveVariantIndex(index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanImages = formData.images.filter(i => i.trim() !== '');
    const finalData = { 
        ...formData, 
        images: cleanImages.length > 0 ? cleanImages : [`https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`] 
    };
    onSubmit(finalData);
  };

  const inputClass = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const sectionClass = "bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6";

  const validImages = formData.images.filter(i => i && i.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
      <div className="bg-slate-50 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-8 py-5 border-b border-gray-200 flex justify-between items-center shrink-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {initialData ? <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Box size={20}/></div> : <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Plus size={20}/></div>}
              {initialData ? t.editProduct : t.addNewProduct}
            </h2>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - 2 Column Layout */}
        <div className="flex-1 overflow-y-auto p-8">
          <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Media & Status (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
               
               {/* Product Images */}
               <div className={sectionClass}>
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ImageIcon size={18} className="text-gray-500"/> {t.images}
                     </h3>
                     <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{validImages.length} items</span>
                  </div>
                  
                  {/* Main Image Preview */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{t.mainImage}</p>
                    <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center overflow-hidden relative group">
                        {validImages.length > 0 ? (
                        <>
                            <img src={validImages[0]} className="w-full h-full object-cover rounded-xl" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                        </>
                        ) : (
                        <div className="text-center p-6 text-gray-400">
                            <ImageIcon size={48} className="mx-auto mb-2 opacity-20"/>
                            <p className="text-sm">No image selected</p>
                        </div>
                        )}
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  {validImages.length > 1 && (
                     <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{t.gallery}</p>
                        <div className="grid grid-cols-4 gap-2">
                            {validImages.slice(1).map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-white shadow-sm">
                                    <img src={img} className="w-full h-full object-cover" />
                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => handleSetMainImage(idx + 1)}
                                            className="p-1.5 bg-white/20 text-white rounded-full hover:bg-white hover:text-indigo-600 transition-colors"
                                            title="Set as Main"
                                        >
                                            <Star size={14} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveImage(idx + 1)}
                                            className="p-1.5 bg-white/20 text-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                  )}

                  {/* Add New Image Controls */}
                  <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                     <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t.addImage}</p>
                     
                     {/* URL Input */}
                     <div className="flex gap-2">
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="https://..."
                            value={newImageUrl}
                            onChange={e => setNewImageUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                        />
                        <button type="button" onClick={handleAddImageUrl} className="bg-white border border-gray-200 text-gray-600 px-3 rounded-lg hover:bg-gray-50"><Plus size={20}/></button>
                     </div>
                     
                     <div className="flex items-center gap-2 text-xs text-gray-400 uppercase font-bold justify-center my-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span>OR</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                     </div>

                     {/* Upload Button */}
                     <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileSelect}
                     />
                     <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 border-2 border-dashed border-indigo-200 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 font-medium flex items-center justify-center gap-2 transition-all"
                     >
                        <Upload size={18} />
                        {t.uploadImage}
                     </button>
                  </div>
               </div>

               {/* Visibility Status */}
               <div className={sectionClass}>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Check size={18} className="text-gray-500"/> Status
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{t.isVisible}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.isVisible}
                        onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
               </div>

            </div>

            {/* Right Column: Details (8 cols) */}
            <div className="lg:col-span-8">
              
              {/* General Info */}
              <div className={sectionClass}>
                 <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <List size={18} className="text-gray-500"/> {t.general}
                 </h3>
                 <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="col-span-2 sm:col-span-1">
                       <label className={labelClass}>{t.name}</label>
                       <input
                          type="text"
                          required
                          className={inputClass}
                          placeholder="Product Name"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                       <label className={labelClass}>{t.category}</label>
                       <select
                          className={inputClass}
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                          {categories.map(c => (
                             <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={labelClass}>{t.description}</label>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={!formData.name || isGenerating}
                        className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                        {isGenerating ? t.generating : t.generateAI}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      className={`${inputClass} resize-none`}
                      placeholder="Product details..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                 </div>
              </div>

              {/* Pricing */}
              <div className={sectionClass}>
                 <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <DollarSign size={18} className="text-gray-500"/> {t.pricing}
                 </h3>
                 <div className="grid grid-cols-3 gap-6">
                    <div>
                       <label className={labelClass}>{t.price}</label>
                       <div className="relative">
                         <input
                            type="number"
                            className={`${inputClass} pl-8`}
                            min="0"
                            placeholder="0"
                            value={formData.price === 0 ? '' : formData.price}
                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                         />
                         <span className="absolute left-3 top-2.5 text-gray-400">₫</span>
                       </div>
                    </div>
                    <div>
                       <label className={labelClass}>{t.costPrice}</label>
                       <div className="relative">
                         <input
                            type="number"
                            className={`${inputClass} pl-8`}
                            min="0"
                            placeholder="0"
                            value={formData.costPrice === 0 ? '' : formData.costPrice}
                            onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                         />
                         <span className="absolute left-3 top-2.5 text-gray-400">₫</span>
                       </div>
                    </div>
                     <div>
                       <label className={labelClass}>{t.sku}</label>
                       <input
                          type="text"
                          className={inputClass}
                          placeholder="SKU-123"
                          value={formData.sku}
                          onChange={e => setFormData({ ...formData, sku: e.target.value })}
                        />
                    </div>
                 </div>
              </div>

              {/* Inventory & Variants */}
              <div className={sectionClass}>
                 <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Tag size={18} className="text-gray-500"/> {t.inventory}
                 </h3>
                 
                 <div className="mb-6">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={formData.hasVariants}
                        onChange={e => setFormData({ ...formData, hasVariants: e.target.checked })}
                      />
                      <span className="font-medium text-gray-700">{t.hasVariants}</span>
                    </label>
                 </div>

                 {!formData.hasVariants ? (
                    <div>
                       <label className={labelClass}>{t.stock}</label>
                       <input
                          type="number"
                          className={inputClass}
                          min="0"
                          placeholder="0"
                          value={formData.stock === 0 ? '' : formData.stock}
                          onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                       />
                    </div>
                 ) : (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-semibold text-gray-700">{formData.variants.length} Variants</span>
                          <button
                            type="button"
                            onClick={handleAddVariant}
                            className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 font-medium transition-all shadow-sm"
                          >
                            + Add Option
                          </button>
                       </div>
                       <div className="space-y-3">
                          {formData.variants.map((variant, idx) => (
                             <div key={idx} className="flex gap-3 items-center">
                                <input
                                  type="text"
                                  placeholder={t.variantName}
                                  className={`${inputClass} flex-[2] bg-white`}
                                  value={variant.name}
                                  onChange={e => updateVariant(idx, 'name', e.target.value)}
                                />
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className={`${inputClass} pl-6 bg-white`}
                                        value={variant.price === 0 ? '' : variant.price}
                                        onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                                    />
                                    <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">₫</span>
                                </div>
                                <input
                                  type="number"
                                  placeholder="Stock"
                                  className={`${inputClass} w-24 bg-white`}
                                  value={variant.stock === 0 ? '' : variant.stock}
                                  onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                                />
                                <button 
                                  type="button"
                                  onClick={() => removeVariant(idx)}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                             </div>
                          ))}
                          {formData.variants.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                              No variants added yet.
                            </div>
                          )}
                       </div>
                    </div>
                 )}
              </div>

            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-white border-t border-gray-200 flex justify-end gap-4 shrink-0 z-10">
           <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors shadow-sm"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            form="productForm"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            {initialData ? t.update : t.add}
          </button>
        </div>

      </div>
      <ConfirmModal
          isOpen={confirmRemoveImageIndex !== null}
          onClose={() => setConfirmRemoveImageIndex(null)}
          onConfirm={() => {
              if (confirmRemoveImageIndex !== null) {
                  setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== confirmRemoveImageIndex) }));
              }
          }}
          title="Xác nhận xóa ảnh"
          message="Bạn có chắc chắn muốn xóa hình ảnh này?"
          lang={lang}
      />
      <ConfirmModal
          isOpen={confirmRemoveVariantIndex !== null}
          onClose={() => setConfirmRemoveVariantIndex(null)}
          onConfirm={() => {
              if (confirmRemoveVariantIndex !== null) {
                  setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== confirmRemoveVariantIndex) }));
              }
          }}
          title="Xác nhận xóa biến thể"
          message="Bạn có chắc chắn muốn xóa biến thể này?"
          lang={lang}
      />
    </div>
  );
};

export default ProductForm;
