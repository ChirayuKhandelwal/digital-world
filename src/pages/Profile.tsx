import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { Package, Clock, Truck, CheckCircle2, ShoppingBag, User as UserIcon, Mail, Phone, LogOut, Edit2, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { showAlert } from "../utils/alert";

export function Profile() {
  const { currentUser, orders, logout, updateUserProfile } = useAppContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    mobile: '',
    houseNo: '',
    landmark: '',
    area: '',
    pincode: '',
    cityState: ''
  });
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  useEffect(() => {
    if (editForm.pincode.length === 6) {
      const fetchDetails = async () => {
        setIsFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${editForm.pincode}`);
          const data = await res.json();
          if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            setEditForm(prev => ({ ...prev, cityState: `${po.District}, ${po.State}` }));
          }
        } catch (error) {
          console.error("Error fetching pincode details", error);
        } finally {
          setIsFetchingPincode(false);
        }
      };
      fetchDetails();
    }
  }, [editForm.pincode]);

  const handleEditClick = () => {
    const parts = (currentUser?.address || "").split('\n');
    let houseNo = '', landmark = '', area = '', cityStatePincode = '';
    if (parts.length >= 3) {
      houseNo = parts[0] || '';
      landmark = parts.length === 4 ? parts[1] : '';
      area = parts[parts.length === 4 ? 2 : 1] || '';
      cityStatePincode = parts[parts.length === 4 ? 3 : 2] || '';
    } else {
      houseNo = currentUser?.address || '';
    }

    const match = cityStatePincode.match(/(\d{6})$/);
    let pincode = '';
    let cityState = cityStatePincode;
    if (match) {
      pincode = match[1];
      cityState = cityStatePincode.replace(/[\s-]*\d{6}$/, '').trim();
    }

    setEditForm({
      name: currentUser?.name || '',
      mobile: currentUser?.mobile || '',
      houseNo,
      landmark,
      area,
      pincode,
      cityState
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedAddress = [editForm.houseNo, editForm.landmark, editForm.area, `${editForm.cityState} - ${editForm.pincode}`]
      .filter(Boolean)
      .join('\n');

    const success = await updateUserProfile({
      name: editForm.name,
      mobile: editForm.mobile,
      address: formattedAddress
    });
    if (success) {
      showAlert.success("Success", "Profile updated successfully!");
      setIsEditing(false);
    } else {
      showAlert.error("Error", "Failed to update profile. Please try again.");
    }
  };

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
        
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-xl shadow-black/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <button 
            onClick={handleEditClick}
            className="absolute top-4 right-4 p-2 text-coolgrey hover:text-electric hover:bg-electric/10 rounded-xl transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-electric/10 rounded-full flex items-center justify-center text-electric text-3xl font-bold shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 w-full">
              <h2 className="text-2xl font-bold text-midnight mb-3 truncate">{currentUser.name}</h2>
              <div className="space-y-2 text-coolgrey font-medium text-sm md:text-base">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 shrink-0 text-electric/70" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
                {currentUser.mobile && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 shrink-0 text-electric/70" />
                    <span className="truncate">{currentUser.mobile}</span>
                  </div>
                )}
                {currentUser.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 shrink-0 text-electric/70 mt-1" />
                    <span className="break-words line-clamp-2">{currentUser.address.replace(/\n/g, ', ')}</span>
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
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold transition-colors w-full md:w-auto justify-center mt-4 md:mt-0 shrink-0"
          >
            <LogOut className="w-5 h-5 shrink-0" />
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

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-midnight/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-2 text-coolgrey hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold text-midnight mb-6">Edit Profile</h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coolgrey mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-coolgrey mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editForm.mobile}
                    onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-coolgrey mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="House No. / Flat No."
                    value={editForm.houseNo}
                    onChange={(e) => setEditForm(prev => ({ ...prev, houseNo: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={editForm.landmark}
                    onChange={(e) => setEditForm(prev => ({ ...prev, landmark: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Area / Locality"
                    value={editForm.area}
                    onChange={(e) => setEditForm(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                  />
                  <div className="flex gap-3">
                    <div className="relative w-1/3">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Pincode"
                        value={editForm.pincode}
                        onChange={(e) => setEditForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                      />
                      {isFetchingPincode && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-electric border-t-transparent rounded-full animate-spin"></div>}
                    </div>
                    <div className="w-2/3">
                      <input
                        type="text"
                        placeholder="City, State"
                        value={editForm.cityState}
                        onChange={(e) => setEditForm(prev => ({ ...prev, cityState: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-midnight font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-colors shadow-md shadow-electric/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
