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
        <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
        <p className="text-slate-400 mb-8">Please log in to view your cart.</p>
        <Link to="/login" className="px-6 py-3 bg-neon-cyan text-slate-950 font-bold rounded-xl hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)]">
          Login Now
        </Link>
      </div>
    );
  }

  const cartItems = currentUser.cart || [];
  const total = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
        <ShoppingBag className="w-10 h-10 text-neon-cyan" />
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-white/10 rounded-2xl backdrop-blur-md">
          <p className="text-xl text-slate-400 mb-6">Your cart is currently empty.</p>
          <Link to="/catalog" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all">
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
                className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-900/50 border border-white/10 rounded-2xl backdrop-blur-md"
              >
                <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-white">{item.product.name}</h3>
                  <p className="text-neon-cyan font-medium">₹{item.product.price.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                    <div className="flex items-center bg-slate-950 rounded-lg border border-white/10 p-1">
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item.product)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteFromCart(item.product.id)}
                  className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all border border-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  aria-label="Remove completely"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-fit sticky top-24">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            <div className="flex justify-between items-center mb-4 text-slate-300">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-slate-300">
              <span>Shipping</span>
              <span className="text-neon-cyan">Free</span>
            </div>
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10 text-xl font-bold text-white">
              <span>Total</span>
              <span className="text-neon-cyan">₹{total.toLocaleString()}</span>
            </div>
            
            <div className="space-y-4 mb-6">
              <h3 className="text-white font-semibold mb-2">Customer Details</h3>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-colors"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-colors"
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-colors"
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
              className="w-full py-4 bg-neon-cyan text-slate-950 font-bold rounded-xl hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)]"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
