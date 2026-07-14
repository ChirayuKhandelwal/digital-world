import { useState, useEffect } from "react";
import { CATEGORY_LIST } from "../data/mockData";
import type { Category, Product } from "../context/AppContext";
import { ProductCard } from "../components/ProductCard";
import { ProductModal } from "../components/ProductModal";
import { ProductFormModal } from "../components/ProductFormModal";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, ChevronDown, Plus } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";

const CATEGORIES: ('All' | Category)[] = ['All', ...CATEGORY_LIST];

export function Catalog() {
  const { products, updateProduct, deleteProduct, addProduct, currentUser } = useAppContext();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<'All' | Category>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
    }
  }, [location.state]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleSaveEdit = (productData: any) => {
    if (editingProduct) {
      updateProduct({ ...productData, id: editingProduct.id } as Product);
    } else {
      addProduct(productData);
    }
    setIsEditModalOpen(false);
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div id="catalog" className="w-full">
      <div className="bg-alabaster border-b border-gray-200 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-midnight mb-4">Complete Catalog</h1>
            <p className="text-coolgrey max-w-2xl text-lg">
              Browse a wide range of home appliances and electronics from trusted brands at competitive retail and wholesale prices.
            </p>
          </div>
          
          {/* Action Buttons & Dropdown Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto shrink-0">
            {currentUser?.role === 'admin' && (
              <button 
                onClick={handleAddNew}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-electric text-white rounded-xl font-bold hover:bg-electric/90 transition-colors shadow-md shadow-electric/20 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            )}
            <div className="flex items-center relative w-full sm:w-72 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SlidersHorizontal className="w-5 h-5 text-electric" />
              </div>
              <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as 'All' | Category)}
              className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-midnight font-medium focus:outline-none focus:ring-2 focus:ring-electric/50 appearance-none cursor-pointer transition-all shadow-sm"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category} className="bg-white text-midnight py-2">
                  {category}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown className="w-5 h-5 text-coolgrey" />
            </div>
          </div>
        </div>
      </div>
      </div>

      <motion.div 
        layout
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12 pb-24"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onQuickView={setSelectedProduct} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isEditModalOpen && (
          <ProductFormModal 
            product={editingProduct} 
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
