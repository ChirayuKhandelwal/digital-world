import { motion } from "framer-motion";
import type { Product } from "../context/AppContext";
import { ShoppingCart, Eye, Edit2, Trash2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/alert";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export function ProductCard({ product, onQuickView, onEdit, onDelete }: ProductCardProps) {
  const { currentUser, addToCart } = useAppContext();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showAlert.warning("Login Required", "Please login to add items to your cart.");
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  return (
    <motion.div
      layout
      onClick={() => onQuickView(product)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white shadow-xl shadow-black/5 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 cursor-pointer"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute bottom-4 left-4 z-20 flex gap-2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/30">
            {product.category}
          </span>
          {product.outOfStock && (
            <span className="px-3 py-1 bg-red-500/80 backdrop-blur-md rounded-full text-xs font-medium text-white border border-red-500/50">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-6">
        <h3 className="text-base sm:text-xl font-bold text-midnight mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-none">{product.name}</h3>
        <p className="text-coolgrey text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">{product.description}</p>
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-base sm:text-2xl font-bold text-midnight">
            ₹{product.price.toLocaleString()}
          </span>
          <div className="flex space-x-1 sm:space-x-2">
            {currentUser?.role === 'admin' ? (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
                  className="p-1.5 sm:p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-coolgrey hover:text-electric transition-colors"
                  aria-label="Edit product"
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(product.id); }}
                  className="p-1.5 sm:p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                  aria-label="Delete product"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleAddToCart}
                disabled={product.outOfStock}
                className={`p-1.5 sm:p-2 bg-electric hover:bg-electric/90 text-white rounded-lg shadow-md shadow-electric/20 transition-all ${product.outOfStock ? 'opacity-50 cursor-not-allowed hover:bg-electric' : ''}`}
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
