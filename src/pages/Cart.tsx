import { useAppContext } from "../context/AppContext";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

export function Cart() {
  const { currentUser, removeFromCart, addToCart, deleteFromCart, placeOrder } = useAppContext();
  
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.mobile || "");

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-midnight mb-4">Your Cart is Empty</h2>
        <p className="text-coolgrey mb-8">Please log in to view your cart.</p>
        <Link to="/login" className="px-6 py-3 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-colors shadow-md shadow-electric/20">
          Login Now
        </Link>
      </div>
    );
  }

  const cartItems = currentUser.cart || [];
  const total = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-midnight mb-8 flex items-center gap-3">
        <ShoppingBag className="w-10 h-10 text-electric" />
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-black/5">
          <p className="text-xl text-coolgrey mb-6">Your cart is currently empty.</p>
          <Link to="/#catalog" className="px-6 py-3 bg-electric hover:bg-electric/90 text-white font-medium rounded-xl transition-all shadow-md shadow-electric/20 inline-block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <motion.div 
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl bg-gray-100" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-midnight">{item.product.name}</h3>
                  <p className="text-electric font-medium">₹{item.product.price.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-coolgrey hover:text-midnight hover:bg-gray-200 rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-midnight">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item.product)}
                        className="p-1 text-coolgrey hover:text-midnight hover:bg-gray-200 rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteFromCart(item.product.id)}
                  className="p-3 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-xl transition-all border border-red-100"
                  aria-label="Remove completely"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-black/5 h-fit sticky top-24">
            <h2 className="text-2xl font-bold text-midnight mb-6">Order Summary</h2>
            <div className="flex justify-between items-center mb-4 text-coolgrey">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-coolgrey">
              <span>Shipping</span>
              <span className="text-electric font-medium">Free</span>
            </div>
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 text-xl font-bold text-midnight">
              <span>Total</span>
              <span className="text-electric">₹{total.toLocaleString()}</span>
            </div>
            
            <div className="space-y-4 mb-6">
              <h3 className="text-midnight font-bold mb-2">Customer Details</h3>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
              />
            </div>

            <button 
              onClick={() => {
                if (!name || !email || !phone) {
                  alert("Please fill in all customer details.");
                  return;
                }
                placeOrder({ name, email, phone });
              }}
              className="w-full py-4 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-all shadow-md shadow-electric/20"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
