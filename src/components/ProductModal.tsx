import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "../context/AppContext";
import { X, CheckCircle2, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/alert";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { currentUser, addToCart } = useAppContext();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = [product.image, ...(product.images || [])];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
      />
      
      <div 
        className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        style={{ marginTop: '96px', height: 'calc(100vh - 96px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-full"
        >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 backdrop-blur-md rounded-full text-coolgrey hover:text-midnight transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 relative bg-gray-100 h-64 md:h-auto shrink-0 group">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={allImages[currentImageIndex]} 
              alt={`${product.name} - view ${currentImageIndex + 1}`}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
          
          {allImages.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-midnight shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-midnight shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentImageIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${currentImageIndex === i ? 'w-4 bg-electric' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col">
          <span className="text-electric text-sm font-bold tracking-wider uppercase mb-2">
            {product.category}
          </span>
          <h2 className="text-3xl font-bold text-midnight mb-4">{product.name}</h2>
          
          <div className="text-2xl font-bold text-midnight mb-6">
            ₹{product.price.toLocaleString()}
          </div>
          
          <p className="text-coolgrey leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="mb-8 flex-1">
            <h3 className="text-lg font-bold text-midnight mb-4">Technical Specifications</h3>
            <ul className="space-y-3">
              {product.specs.map((spec, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-electric mt-0.5 mr-3 shrink-0" />
                  <span className="text-coolgrey">{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200">
            <button 
              onClick={() => {
                if (!currentUser) {
                  showAlert.warning("Login Required", "Please login to add items to your cart.");
                  navigate('/login');
                  return;
                }
                addToCart(product);
                onClose();
              }}
              disabled={product.outOfStock}
              className={`w-full bg-electric text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-electric/90 shadow-md shadow-electric/20 transition-all ${product.outOfStock ? 'opacity-50 cursor-not-allowed hover:bg-electric' : ''}`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{product.outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
        </motion.div>
      </div>
    </>
  );
}
