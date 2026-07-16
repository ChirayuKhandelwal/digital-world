import { useState, useEffect } from 'react';
import { CATEGORY_LIST } from '../data/mockData';
import type { Product, Category } from '../context/AppContext';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: any) => void;
}

const CATEGORIES: Category[] = [...CATEGORY_LIST];

export function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORY_LIST[0] as Category,
    price: '',
    description: '',
    image: '',
    specs: '',
    outOfStock: false
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        description: product.description,
        image: product.image,
        specs: product.specs.join('\n'),
        outOfStock: product.outOfStock || false
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...(product ? { id: product.id } : {}),
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      description: formData.description,
      image: formData.image,
      specs: formData.specs.split('\n').filter(s => s.trim() !== ''),
      outOfStock: formData.outOfStock
    };
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-midnight">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-coolgrey hover:text-midnight transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-coolgrey mb-1">Product Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-coolgrey mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50">
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-white text-midnight">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-coolgrey mb-1">Price (₹)</label>
                <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coolgrey mb-1">Description</label>
              <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-coolgrey mb-1">Image URL (GitHub Raw Link)</label>
              <input required type="url" placeholder="https://raw.githubusercontent.com/..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-coolgrey mb-1">Specifications (1 per line)</label>
              <textarea required rows={4} value={formData.specs} onChange={e => setFormData({...formData, specs: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50" placeholder="e.g. 16GB RAM&#10;512GB SSD" />
            </div>

            <div className="flex items-center mt-2">
              <input type="checkbox" id="outOfStock" checked={formData.outOfStock} onChange={e => setFormData({...formData, outOfStock: e.target.checked})} className="mr-2" />
              <label htmlFor="outOfStock" className="text-sm font-medium text-coolgrey">Out of Stock</label>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button onClick={onClose} type="button" className="px-6 py-2 rounded-xl bg-gray-100 text-midnight font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button form="product-form" type="submit" className="px-6 py-2 rounded-xl bg-electric text-white font-bold hover:bg-electric/90 shadow-md shadow-electric/20 transition-all">
            Save Product
          </button>
        </div>
      </motion.div>
    </div>
  );
}
