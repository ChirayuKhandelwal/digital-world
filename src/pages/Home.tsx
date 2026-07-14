import { Hero } from "../components/Hero";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { ProductModal } from "../components/ProductModal";
import { ProductFormModal } from "../components/ProductFormModal";
import { useState } from "react";
import type { Product } from "../context/AppContext";
import { AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export function Home() {
  const { products, updateProduct, deleteProduct } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    updateProduct(productData as Product);
    setIsEditModalOpen(false);
  };

  return (
    <div>
      <Hero />
      
      {/* Main Content Area */}
      <main className="relative z-10">
        <FeaturedProducts 
          products={products}
          onQuickView={setSelectedProduct}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

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
