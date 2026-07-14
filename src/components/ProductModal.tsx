import { motion } from "framer-motion";
import type { Product } from "../context/AppContext";
import { X, CheckCircle2, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { currentUser, addToCart } = useAppContext();
  const navigate = useNavigate();

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 relative bg-slate-950 h-64 md:h-auto shrink-0">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col">
          <span className="text-neon-cyan text-sm font-semibold tracking-wider uppercase mb-2">
            {product.category}
          </span>
          <h2 className="text-3xl font-bold text-white mb-4">{product.name}</h2>
          
          <div className="text-2xl font-bold text-white mb-6">
            ${product.price.toLocaleString()}
          </div>
          
          <p className="text-slate-300 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="mb-8 flex-1">
            <h3 className="text-lg font-semibold text-white mb-4">Technical Specifications</h3>
            <ul className="space-y-3">
              {product.specs.map((spec, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-neon-cyan mt-0.5 mr-3 shrink-0" />
                  <span className="text-slate-300">{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button 
              onClick={() => {
                if (!currentUser) {
                  alert("Please login to add items to your cart.");
                  navigate('/login');
                  return;
                }
                addToCart(product);
                onClose();
              }}
              className="w-full bg-neon-cyan text-slate-950 px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
