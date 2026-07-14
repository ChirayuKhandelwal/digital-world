import { motion } from "framer-motion";
import { Shield, Zap, Award } from "lucide-react";

export function ValuePropositions() {
  return (
    <div className="w-full max-w-[100vw] pb-32 lg:pb-48 m-0 box-border bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 box-border m-0 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-colors">
            <div className="mx-auto w-12 h-12 bg-neon-cyan/10 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-neon-cyan" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Top Brands Available</h3>
            <p className="text-slate-400 text-sm">LG, Samsung, Haier, Voltas, Bajaj, Usha, Orient and many more trusted brands under one roof.</p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-colors">
            <div className="mx-auto w-12 h-12 bg-neon-fuchsia/10 rounded-full flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-neon-fuchsia" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Wholesale & Retail Supply</h3>
            <p className="text-slate-400 text-sm">Special pricing for dealers, institutions, shops, builders, and bulk orders.</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-colors">
            <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Genuine Products & Support</h3>
            <p className="text-slate-400 text-sm">100% original products with manufacturer warranty and installation support.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
