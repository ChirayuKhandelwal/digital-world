import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Edit2, Trash2, Plus } from 'lucide-react';
import type { Product, Order } from '../context/AppContext';
import { ProductFormModal } from '../components/ProductFormModal';
import { AnimatePresence } from 'framer-motion';

export function AdminDashboard() {
  const { currentUser, products, addProduct, updateProduct, deleteProduct, orders } = useAppContext();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleSave = (productData: any) => {
    if (editingProduct) {
      updateProduct(productData as Product);
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage DIGITAL WORLD inventory and orders</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-neon-cyan text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-slate-400 hover:text-white'}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-neon-cyan text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-slate-400 hover:text-white'}`}
          >
            Orders
          </button>
        </div>

        {activeTab === 'products' && (
          <button 
            onClick={handleAddNew}
            className="flex items-center space-x-2 bg-neon-cyan text-slate-950 px-4 py-2 rounded-xl font-bold hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {activeTab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-white/5 text-xs uppercase text-slate-300 border-b border-white/10">
              <tr>
                <th scope="col" className="px-6 py-4">Product Name</th>
                <th scope="col" className="px-6 py-4">Category</th>
                <th scope="col" className="px-6 py-4">Price</th>
                <th scope="col" className="px-6 py-4">Featured</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover border border-white/10" />
                    <span>{product.name}</span>
                  </td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">${product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {product.featured ? (
                      <span className="px-2 py-1 bg-neon-cyan/20 text-neon-cyan rounded text-xs font-medium border border-neon-cyan/30">Yes</span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs font-medium border border-white/10">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No products found. Add some to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-white/5 text-xs uppercase text-slate-300 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4">Order ID</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4">Customer Details</th>
                  <th scope="col" className="px-6 py-4">Items</th>
                  <th scope="col" className="px-6 py-4">Total</th>
                  <th scope="col" className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{order.id}</td>
                    <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{order.customer?.name || 'Guest'}</div>
                      <div className="text-xs text-slate-400">{order.customer?.email}</div>
                      <div className="text-xs text-slate-400">{order.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-bold text-neon-cyan">${order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium border border-green-500/30">Completed</span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ProductFormModal 
            product={editingProduct} 
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
