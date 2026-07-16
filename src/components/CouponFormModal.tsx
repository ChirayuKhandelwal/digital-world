import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Coupon } from '../context/AppContext';

interface Props {
  coupon: Coupon | null;
  onClose: () => void;
  onSave: (data: Omit<Coupon, 'id'> | Coupon) => void;
}

export function CouponFormModal({ coupon, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    discount_percentage: coupon?.discount_percentage || 10,
    allowed_customer_ids: coupon?.allowed_customer_ids?.join(', ') || '',
    is_active: coupon ? coupon.is_active : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allowed = formData.allowed_customer_ids
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    const dataToSave = {
      ...coupon,
      code: formData.code.toUpperCase(),
      discount_percentage: Number(formData.discount_percentage),
      allowed_customer_ids: allowed,
      is_active: formData.is_active,
    };

    onSave(dataToSave as unknown as Coupon);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-bold text-midnight">{coupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
          <button onClick={onClose} className="p-2 text-coolgrey hover:text-midnight hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-midnight mb-2">Coupon Code</label>
              <input 
                type="text" 
                required 
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                placeholder="e.g. SUMMER20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-midnight mb-2">Discount Percentage (%)</label>
              <input 
                type="number" 
                required 
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={e => setFormData({...formData, discount_percentage: Number(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight mb-2">Allowed Customer IDs/Emails (comma separated)</label>
              <input 
                type="text"
                value={formData.allowed_customer_ids}
                onChange={e => setFormData({...formData, allowed_customer_ids: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                placeholder="Leave blank for everyone, or 'user@a.com, user2@b.com'"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input 
                type="checkbox" 
                id="is_active"
                checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                className="w-5 h-5 rounded border-gray-300 text-electric focus:ring-electric"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-midnight cursor-pointer">
                Coupon is active and usable
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 text-coolgrey font-bold hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-electric text-white px-6 py-3 rounded-xl font-bold hover:bg-electric/90 shadow-md shadow-electric/20 transition-all"
            >
              <Save className="w-5 h-5" />
              Save Coupon
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
