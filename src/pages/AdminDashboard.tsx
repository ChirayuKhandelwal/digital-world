import { useEffect, useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Edit2, Trash2, Plus, ChevronDown, ChevronUp, Download, Search, Calendar, Filter } from 'lucide-react';
import type { Product, Order } from '../context/AppContext';
import { ProductFormModal } from '../components/ProductFormModal';
import { AnimatePresence, motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function AdminDashboard() {
  const { currentUser, products, addProduct, updateProduct, deleteProduct, orders, updateOrder, deleteOrder } = useAppContext();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');

  // Orders State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  // Product Handlers
  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
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

  // Order Handlers
  const toggleOrderExpand = (id: string) => {
    const newSet = new Set(expandedOrders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedOrders(newSet);
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrder(id);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const orderDate = new Date(order.date).toISOString().split('T')[0];
    const matchesDate = dateFilter ? orderDate === dateFilter : true;
    
    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleExportExcel = () => {
    const exportData = filteredOrders.map((o, index) => ({
      'S.No': index + 1,
      'Order ID': o.id,
      'Date & Time': new Date(o.date).toLocaleString(),
      'Customer Name': o.customer?.name,
      'Mobile Number': o.customer?.phone,
      'Total Amount': `₹${o.total.toLocaleString()}`,
      'Order Status': o.status,
      'Payment Status': o.paymentStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "Orders_Export.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders Report", 14, 15);
    
    const tableColumn = ["S.No", "Order ID", "Date & Time", "Customer Name", "Total", "Status", "Payment"];
    const tableRows = filteredOrders.map((o, index) => [
      index + 1,
      o.id,
      new Date(o.date).toLocaleString(),
      o.customer?.name,
      `₹${o.total.toLocaleString()}`,
      o.status,
      o.paymentStatus
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save("Orders_Export.pdf");
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage DIGITAL WORLD inventory and orders</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-neon-cyan text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-slate-400 hover:text-white'}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-neon-cyan text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-slate-400 hover:text-white'}`}
          >
            Orders
          </button>
        </div>

        {activeTab === 'products' && (
          <button 
            onClick={handleAddNew}
            className="flex items-center space-x-2 bg-neon-cyan text-slate-950 px-4 py-2 rounded-xl font-bold hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {activeTab === 'orders' && (
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Name, Phone, ID..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan [color-scheme:dark]"
              />
            </div>

            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <button onClick={handleExportExcel} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button onClick={handleExportPDF} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      )}

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
                  <td className="px-6 py-4">₹{product.price.toLocaleString()}</td>
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
                      onClick={() => handleDeleteProduct(product.id)}
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
            <table className="w-full text-left text-sm text-slate-400 whitespace-nowrap">
              <thead className="bg-white/5 text-xs uppercase text-slate-300 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-4 py-4 w-12 text-center">#</th>
                  <th scope="col" className="px-4 py-4">Order ID</th>
                  <th scope="col" className="px-4 py-4">Date & Time</th>
                  <th scope="col" className="px-4 py-4">Customer Info</th>
                  <th scope="col" className="px-4 py-4">Total</th>
                  <th scope="col" className="px-4 py-4">Status</th>
                  <th scope="col" className="px-4 py-4">Payment</th>
                  <th scope="col" className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const isExpanded = expandedOrders.has(order.id);
                  const orderDate = new Date(order.date);
                  
                  return (
                    <React.Fragment key={order.id}>
                      <tr className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5' : ''}`}>
                        <td className="px-4 py-4 text-center font-medium text-slate-500">{index + 1}</td>
                        <td className="px-4 py-4 font-medium text-white">{order.id}</td>
                        <td className="px-4 py-4">
                          <div className="text-white">{orderDate.toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{order.customer?.name || 'Guest'}</div>
                          <div className="text-xs text-slate-400">{order.customer?.phone}</div>
                        </td>
                        <td className="px-4 py-4 font-bold text-neon-cyan">₹{order.total.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrder(order.id, { status: e.target.value as Order['status'] })}
                            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs font-medium text-white focus:outline-none focus:border-neon-cyan"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <select 
                            value={order.paymentStatus}
                            onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value as Order['paymentStatus'] })}
                            className={`bg-black/30 border border-white/10 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:border-neon-cyan ${
                              order.paymentStatus === 'Paid' ? 'text-green-400' :
                              order.paymentStatus === 'COD' ? 'text-blue-400' : 'text-yellow-400'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="COD">COD</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-right space-x-2">
                          <button 
                            onClick={() => toggleOrderExpand(order.id)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                            title={isExpanded ? "Collapse Details" : "Expand Details"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <tr className="bg-black/20 border-b border-white/5">
                            <td colSpan={8} className="p-0 border-none">
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                  {/* Customer Full Details */}
                                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 h-fit">
                                    <h4 className="text-white font-semibold mb-4 border-b border-white/10 pb-2">Customer Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="text-slate-500">Name:</span> <span className="text-white ml-2">{order.customer?.name}</span></p>
                                      <p><span className="text-slate-500">Email:</span> <span className="text-white ml-2">{order.customer?.email}</span></p>
                                      <p><span className="text-slate-500">Phone:</span> <span className="text-white ml-2">{order.customer?.phone}</span></p>
                                      {order.customer?.address && (
                                        <div className="pt-2 mt-2 border-t border-white/5">
                                          <span className="text-slate-500 block mb-1">Address:</span>
                                          <p className="text-white bg-black/20 p-2 rounded border border-white/5 whitespace-pre-wrap leading-relaxed">{order.customer.address}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Order Items Table */}
                                  <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                    <h4 className="text-white font-semibold mb-4 border-b border-white/10 pb-2">Order Items</h4>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-sm text-slate-400">
                                        <thead className="bg-black/30 text-xs text-slate-500">
                                          <tr>
                                            <th className="px-4 py-2 rounded-l-lg">Product</th>
                                            <th className="px-4 py-2">Qty</th>
                                            <th className="px-4 py-2 text-right rounded-r-lg">Price</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {order.items.map((item, i) => (
                                            <tr key={i} className="border-b border-white/5 last:border-0">
                                              <td className="px-4 py-3 text-white flex items-center gap-3">
                                                <img src={item.product.image} className="w-8 h-8 rounded object-cover" alt="" />
                                                <span>{item.product.name}</span>
                                              </td>
                                              <td className="px-4 py-3">{item.quantity}</td>
                                              <td className="px-4 py-3 text-right">₹{(item.product.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                          ))}
                                          <tr className="bg-black/30">
                                            <td colSpan={2} className="px-4 py-3 text-right font-semibold text-white rounded-l-lg">Grand Total</td>
                                            <td className="px-4 py-3 text-right font-bold text-neon-cyan rounded-r-lg">₹{order.total.toLocaleString()}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      No orders found matching your filters.
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
