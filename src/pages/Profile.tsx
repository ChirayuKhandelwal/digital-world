import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { Package, Clock, Truck, CheckCircle2, ShoppingBag, User as UserIcon, Mail, Phone, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export function Profile() {
  const { currentUser, orders, logout } = useAppContext();

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-midnight mb-4">Please Log In</h2>
        <p className="text-coolgrey mb-8">You need to be logged in to view your profile.</p>
        <Link to="/login" className="px-6 py-3 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-colors shadow-md shadow-electric/20">
          Login Now
        </Link>
      </div>
    );
  }

  const myOrders = orders.filter(order => order.userId === currentUser.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'Processing': return <Package className="w-6 h-6 text-blue-500" />;
      case 'Shipped': return <Truck className="w-6 h-6 text-indigo-500" />;
      case 'Out for Delivery': return <Truck className="w-6 h-6 text-orange-500" />;
      case 'Delivered': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      default: return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Shipped': return 'bg-indigo-100 text-indigo-700';
      case 'Out for Delivery': return 'bg-orange-100 text-orange-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Profile Header section */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <UserIcon className="w-8 h-8 text-electric" />
          <h1 className="text-4xl font-bold text-midnight">My Profile</h1>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl shadow-black/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-electric/10 rounded-full flex items-center justify-center text-electric text-3xl font-bold">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-midnight mb-2">{currentUser.name}</h2>
              <div className="space-y-1 text-coolgrey font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {currentUser.email}
                </div>
                {currentUser.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {currentUser.mobile}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold transition-colors w-full md:w-auto justify-center"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Orders section */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-8 h-8 text-electric" />
          <h2 className="text-3xl font-bold text-midnight">Order History</h2>
        </div>

        {myOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 shadow-xl shadow-black/5 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-midnight mb-2">No Orders Yet</h2>
            <p className="text-coolgrey mb-6">Looks like you haven't placed any orders yet.</p>
            <Link to="/" className="inline-block px-6 py-3 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {myOrders.map((order, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={order.id} 
                className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl shadow-black/5 flex flex-col md:flex-row gap-6"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Order #{order.id}</p>
                      <p className="text-midnight font-medium">{new Date(order.date).toLocaleString()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                        <div className="flex-1">
                          <h4 className="font-bold text-midnight">{item.product.name}</h4>
                          <p className="text-sm text-coolgrey">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-bold text-midnight">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-64 bg-gray-50 p-6 rounded-2xl flex flex-col justify-between shrink-0">
                  <div>
                    <h4 className="font-bold text-midnight mb-4">Payment Summary</h4>
                    <div className="space-y-2 text-sm text-coolgrey mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{(order.total + (order.paymentModeDiscount || 0) + (order.discountAmount || 0)).toLocaleString()}</span>
                      </div>
                      {order.paymentModeDiscount ? (
                        <div className="flex justify-between text-green-600">
                          <span>Payment ({order.paymentMode})</span>
                          <span>{order.paymentModeDiscount > 0 ? '-' : '+'}₹{Math.abs(order.paymentModeDiscount).toLocaleString()}</span>
                        </div>
                      ) : null}
                      {order.discountAmount ? (
                        <div className="flex justify-between text-green-600">
                          <span>Coupon ({order.discountApplied})</span>
                          <span>-₹{order.discountAmount.toLocaleString()}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-midnight">Total</span>
                      <span className="text-electric text-xl">₹{order.total.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-xs text-right text-gray-500 font-medium">
                      Status: {order.paymentStatus}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
