import type { Product } from "../context/AppContext";
import { ProductCard } from "./ProductCard";

interface FeaturedProductsProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function FeaturedProducts({ products, onQuickView, onEdit, onDelete }: FeaturedProductsProps) {
  // Display featured products, fallback to first 4 if none are explicitly featured
  const featured = products.filter(p => p.featured);
  const displayProducts = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
      {/* Background glow effects for the section */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-y-1/2" />

      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
          Featured Products
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Explore our most popular home appliances and electronics from trusted brands.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 relative z-10">
        {displayProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onQuickView={onQuickView} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
