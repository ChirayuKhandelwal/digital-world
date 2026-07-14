import { motion } from "framer-motion";
import type { Product } from "../context/AppContext";
import { ShoppingCart, Eye, Edit2, Trash2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export function ProductCard({ product, onQuickView, onEdit, onDelete }: ProductCardProps) {
  const { currentUser, addToCart } = useAppContext();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!currentUser) {
      alert("Please login to add items to your cart.");
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-900/50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10" />
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute bottom-4 left-4 z-20">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/20">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-4">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">
            ₹{product.price.toLocaleString()}
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => onQuickView(product)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
            {currentUser?.role === 'admin' ? (
              <>
                <button 
                  onClick={() => onEdit?.(product)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  aria-label="Edit product"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDelete?.(product.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                  aria-label="Delete product"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleAddToCart}
                className="p-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/20 rounded-lg text-neon-cyan transition-all hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
