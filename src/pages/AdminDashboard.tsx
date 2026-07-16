import { useEffect, useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Edit2, Trash2, Plus, ChevronDown, ChevronUp, Download, Search, Calendar, Filter, Tag, Settings, Save, Shield } from 'lucide-react';
import type { Product, Order, Coupon, DiscountSettings } from '../context/AppContext';
import { ProductFormModal } from '../components/ProductFormModal';
import { CouponFormModal } from '../components/CouponFormModal';
import { AnimatePresence, motion } from 'framer-motion';
import { showAlert } from '../utils/alert';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { auth } from '../lib/firebase';

export function AdminDashboard() {
  const { currentUser, products, addProduct, updateProduct, deleteProduct, orders, updateOrder, deleteOrder, coupons, addCoupon, updateCoupon, deleteCoupon, discountSettings, updateDiscountSettings } = useAppContext();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'users'>('orders');

  // Coupon State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Users State
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Discount Settings State
  const [localSettings, setLocalSettings] = useState<DiscountSettings>({ advance_multiplier: 1, partial_multiplier: 1, cod_multiplier: 1 });

  useEffect(() => {
    if (discountSettings) setLocalSettings(discountSettings);
  }, [discountSettings]);

  useEffect(() => {
    if (activeTab === 'users' && currentUser?.role === 'owner') {
      fetchUsers();
    }
  }, [activeTab, currentUser]);

  const fetchUsers = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch('/api/get-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users || []);
      } else {
        showAlert.error("Error", "Failed to fetch users");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch('/api/update-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: userId, newRole })
      });

      if (res.ok) {
        showAlert.success("Success", "User role updated successfully");
        fetchUsers();
      } else {
        const data = await res.json();
        showAlert.error("Error", data.error || "Failed to update role");
      }
    } catch (error) {
      console.error(error);
      showAlert.error("Error", "Network error updating role");
    }
  };

  // Orders State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser || !['owner', 'admin', 'staff'].includes(currentUser.role)) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || !['owner', 'admin', 'staff'].includes(currentUser.role)) return null;

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
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (order.customer?.name || '').toLowerCase().includes(q) ||
      (order.customer?.phone || '').includes(q) ||
      (order.id || '').toLowerCase().includes(q);
    
    let matchesDate = true;
    if (dateFilter && order.date) {
      try {
        const orderDate = new Date(order.date).toISOString().split('T')[0];
        matchesDate = orderDate === dateFilter;
      } catch (e) {
        matchesDate = false;
      }
    }
    
    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleExportExcel = () => {
    try {
      const exportData = filteredOrders.map((o, index) => ({
        'S.No': index + 1,
        'Order ID': o.id,
        'Date & Time': o.date ? new Date(o.date).toLocaleString() : 'N/A',
        'Customer Name': o.customer?.name || 'Guest',
        'Mobile Number': o.customer?.phone || 'N/A',
        'Total Amount': `₹${o.total?.toLocaleString() || 0}`,
        'Order Status': o.status || 'Pending',
        'Payment Status': o.paymentStatus || 'Pending',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, "Orders_Export.xlsx");
    } catch (e) {
      console.error("Failed to export Excel:", e);
      showAlert.error("Export Failed", "Failed to export to Excel. Check console for details.");
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Orders Report", 14, 15);
      
      const tableColumn = ["S.No", "Order ID", "Date & Time", "Customer Name", "Total", "Status", "Payment"];
      const tableRows = filteredOrders.map((o, index) => [
        index + 1,
        o.id,
        o.date ? new Date(o.date).toLocaleString() : 'N/A',
        o.customer?.name || 'Guest',
        `₹${o.total?.toLocaleString() || 0}`,
        o.status || 'Pending',
        o.paymentStatus || 'Pending'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      
      doc.save("Orders_Export.pdf");
    } catch (e) {
      console.error("Failed to export PDF:", e);
      showAlert.error("Export Failed", "Failed to export to PDF. Check console for details.");
    }
  };

  const handleSendOTP = async (orderId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/generate-delivery-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert.success("Success", "Delivery OTP sent successfully to the customer's email.");
      } else {
        showAlert.error("Error", data.error || "Failed to send Delivery OTP");
      }
    } catch (e) {
      console.error(e);
      showAlert.error("Error", "An error occurred while sending OTP.");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-midnight">Admin Dashboard</h1>
          <p className="text-coolgrey mt-1">Manage DIGITAL WORLD inventory and orders</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 w-full md:w-auto overflow-x-auto shrink-0">
          {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-white text-midnight shadow-sm' : 'text-coolgrey hover:text-midnight'}`}
            >
              Products
            </button>
          )}
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-midnight shadow-sm' : 'text-coolgrey hover:text-midnight'}`}
          >
            Orders
          </button>
          {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'coupons' ? 'bg-white text-midnight shadow-sm' : 'text-coolgrey hover:text-midnight'}`}
            >
              <Tag className="w-4 h-4" />
              Coupons
            </button>
          )}
          {currentUser.role === 'owner' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-midnight shadow-sm' : 'text-coolgrey hover:text-midnight'}`}
            >
              <Settings className="w-4 h-4" />
              User Management
            </button>
          )}
        </div>

        {activeTab === 'products' && (
          <button 
            onClick={handleAddNew}
            className="flex items-center space-x-2 bg-electric text-white px-4 py-2 rounded-xl font-bold hover:bg-electric/90 shadow-md shadow-electric/20 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgrey" />
              <input 
                type="text" 
                placeholder="Search Name, Phone, ID..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50 transition-colors"
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgrey" />
              <input 
                type="date" 
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50 transition-colors"
              />
            </div>

            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgrey" />
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50 appearance-none transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <button onClick={handleExportExcel} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-600 border border-green-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button onClick={handleExportPDF} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      )}

      {(activeTab === 'products' || activeTab === 'orders') && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl shadow-black/5">
          {activeTab === 'products' && (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-coolgrey">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
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
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-midnight flex items-center space-x-3">
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover border border-gray-200" />
                    <span>{product.name}</span>
                  </td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-electric">₹{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {product.featured ? (
                      <span className="px-2 py-1 bg-electric/10 text-electric rounded text-xs font-bold border border-electric/20">Yes</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-coolgrey rounded text-xs font-medium border border-gray-200">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 bg-gray-50 hover:bg-gray-200 rounded-lg text-coolgrey hover:text-midnight transition-colors border border-transparent hover:border-gray-200"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 transition-colors border border-transparent hover:border-red-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No products found. Add some to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-coolgrey whitespace-nowrap">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
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
                      <tr 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                        onClick={() => toggleOrderExpand(order.id)}
                      >
                        <td className="px-4 py-4 text-center font-medium text-gray-400">{index + 1}</td>
                        <td className="px-4 py-4 font-bold text-midnight">{order.id}</td>
                        <td className="px-4 py-4">
                          <div className="text-midnight">{order.date ? orderDate.toLocaleDateString() : 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.date ? orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-midnight">{order.customer?.name || 'Guest'}</div>
                          <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                        </td>
                        <td className="px-4 py-4 font-bold text-electric">₹{order.total?.toLocaleString() || 0}</td>
                        <td className="px-4 py-4">
                          <select 
                            value={order.status || 'Pending'}
                            onChange={(e) => updateOrder(order.id, { status: e.target.value as Order['status'] })}
                            onClick={e => e.stopPropagation()}
                            className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium text-midnight focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric shadow-sm"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <select 
                            value={order.paymentStatus || 'Pending'}
                            onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value as Order['paymentStatus'] })}
                            onClick={e => e.stopPropagation()}
                            className={`bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric shadow-sm ${
                              order.paymentStatus === 'Paid' ? 'text-green-600' :
                              order.paymentStatus === 'COD' ? 'text-blue-600' : 'text-yellow-600'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="COD">COD</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-right space-x-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleOrderExpand(order.id); }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-coolgrey hover:text-midnight transition-colors border border-transparent hover:border-gray-200"
                            title={isExpanded ? "Collapse Details" : "Expand Details"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 transition-colors border border-transparent hover:border-red-200"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <td colSpan={8} className="p-0 border-none">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-300">
                                  {/* Customer Full Details */}
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 h-fit shadow-sm">
                                    <h4 className="text-midnight font-bold mb-4 border-b border-gray-100 pb-2">Customer Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="text-gray-500">Name:</span> <span className="text-midnight font-medium ml-2">{order.customer?.name}</span></p>
                                      <p><span className="text-gray-500">Email:</span> <span className="text-midnight font-medium ml-2">{order.customer?.email}</span></p>
                                      <p><span className="text-gray-500">Phone:</span> <span className="text-midnight font-medium ml-2">{order.customer?.phone}</span></p>
                                        {order.customer?.address && (
                                          <div className="pt-2 mt-2 border-t border-gray-100">
                                            <span className="text-gray-500 block mb-1">Address:</span>
                                            <p className="text-midnight bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-wrap leading-relaxed">{order.customer.address}</p>
                                          </div>
                                        )}
                                        {order.status === 'Out for Delivery' && (
                                          <div className="pt-4 mt-4 border-t border-gray-100">
                                            <button 
                                              onClick={() => handleSendOTP(order.id)}
                                              className="w-full py-2 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-all shadow-md shadow-electric/20 text-sm"
                                            >
                                              Send Delivery OTP
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                  {/* Order Items Table */}
                                  <div className="md:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-midnight font-bold mb-4 border-b border-gray-100 pb-2">Order Items</h4>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-sm text-coolgrey">
                                        <thead className="bg-gray-50 text-xs text-gray-500">
                                          <tr>
                                            <th className="px-4 py-2 rounded-l-lg font-bold">Product</th>
                                            <th className="px-4 py-2 font-bold">Qty</th>
                                            <th className="px-4 py-2 text-right rounded-r-lg font-bold">Price</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {order.items.map((item, i) => (
                                            <tr key={i} className="border-b border-gray-100 last:border-0">
                                              <td className="px-4 py-3 text-midnight font-medium flex items-center gap-3">
                                                <img src={item.product.image} className="w-8 h-8 rounded object-cover border border-gray-100" alt="" />
                                                <span>{item.product.name}</span>
                                              </td>
                                              <td className="px-4 py-3">{item.quantity}</td>
                                              <td className="px-4 py-3 text-right">₹{(item.product.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                          ))}
                                          {order.paymentModeDiscount ? (
                                            <tr className="bg-gray-50/50">
                                              <td colSpan={2} className="px-4 py-2 text-right font-medium text-gray-500 border-t border-gray-100">
                                                Payment Discount ({order.paymentMode})
                                              </td>
                                              <td className="px-4 py-2 text-right font-medium text-green-600 border-t border-gray-100">
                                                {order.paymentModeDiscount > 0 ? '-' : '+'}₹{Math.abs(order.paymentModeDiscount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                              </td>
                                            </tr>
                                          ) : null}
                                          {order.discountAmount ? (
                                            <tr className="bg-gray-50/50">
                                              <td colSpan={2} className="px-4 py-2 text-right font-medium text-gray-500 border-t border-gray-100">
                                                Coupon Discount {order.discountApplied ? `(${order.discountApplied})` : ''}
                                              </td>
                                              <td className="px-4 py-2 text-right font-medium text-green-600 border-t border-gray-100">
                                                -₹{order.discountAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                              </td>
                                            </tr>
                                          ) : null}
                                          <tr className="bg-gray-50">
                                            <td colSpan={2} className="px-4 py-3 text-right font-bold text-midnight rounded-l-lg border-t border-gray-200">Grand Total</td>
                                            <td className="px-4 py-3 text-right font-bold text-electric rounded-r-lg border-t border-gray-200">₹{order.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No orders found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {activeTab === 'coupons' && (
        <div className="space-y-8">
          {/* Discount Settings Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl shadow-black/5">
            <h2 className="text-xl font-bold text-midnight mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-electric" />
              Global Discount Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Advance Multiplier (e.g. 0.9 for 10% off)</label>
                <input
                  type="number" step="0.01" min="0" max="1"
                  value={localSettings.advance_multiplier}
                  onChange={e => setLocalSettings(prev => ({ ...prev, advance_multiplier: parseFloat(e.target.value) }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Partial Multiplier</label>
                <input
                  type="number" step="0.01" min="0" max="1"
                  value={localSettings.partial_multiplier}
                  onChange={e => setLocalSettings(prev => ({ ...prev, partial_multiplier: parseFloat(e.target.value) }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">COD Multiplier</label>
                <input
                  type="number" step="0.01" min="0" max="1"
                  value={localSettings.cod_multiplier}
                  onChange={e => setLocalSettings(prev => ({ ...prev, cod_multiplier: parseFloat(e.target.value) }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => updateDiscountSettings(localSettings)}
                className="flex items-center gap-2 bg-midnight text-white px-6 py-2 rounded-xl font-bold hover:bg-midnight/90 shadow-md shadow-black/20 transition-all"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </div>

          {/* Coupons Table Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl shadow-black/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-midnight flex items-center gap-2">
                <Tag className="w-5 h-5 text-electric" />
                Manual Coupons
              </h2>
              <button 
                onClick={() => { setEditingCoupon(null); setIsCouponModalOpen(true); }}
                className="flex items-center space-x-2 bg-electric text-white px-4 py-2 rounded-xl font-bold hover:bg-electric/90 shadow-md shadow-electric/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-coolgrey">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Discount %</th>
                    <th className="px-6 py-4">Allowed Customers</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(coupon => (
                    <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-midnight">{coupon.code}</td>
                      <td className="px-6 py-4">{coupon.discount_percentage}%</td>
                      <td className="px-6 py-4">{coupon.allowed_customer_ids.length > 0 ? coupon.allowed_customer_ids.join(', ') : 'Everyone'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => { setEditingCoupon(coupon); setIsCouponModalOpen(true); }}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-coolgrey hover:text-midnight transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => window.confirm("Delete this coupon?") && deleteCoupon(coupon.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No coupons created yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && currentUser.role === 'owner' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-black/5 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-midnight">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-coolgrey uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Current Role</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-midnight">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-coolgrey">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'staff' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.role === 'owner'}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-midnight focus:border-electric focus:ring-1 focus:ring-electric/50 disabled:opacity-50"
                      >
                        {user.role === 'owner' && <option value="owner">Owner</option>}
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {allUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Loading users...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <ProductFormModal 
            product={editingProduct} 
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
          />
        )}
        {isCouponModalOpen && (
          <CouponFormModal
            coupon={editingCoupon}
            onClose={() => setIsCouponModalOpen(false)}
            onSave={(data) => {
              if (editingCoupon) updateCoupon(data as Coupon);
              else addCoupon(data);
              setIsCouponModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
