import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Award } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative overflow-hidden w-full max-w-[100vw] pt-20 pb-32 lg:pt-32 lg:pb-48 m-0 box-border">
      {/* Abstract background blobs (additional to Layout for Hero specifically) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-gradient-to-r from-neon-cyan/20 to-neon-fuchsia/20 blur-[100px] -z-10 rounded-full mix-blend-screen opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 box-border m-0 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1 
            variants={itemVariants} 
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-fuchsia drop-shadow-[0_0_20px_rgba(0,243,255,0.3)] uppercase"
          >
            DIGITAL WORLD
          </motion.h1>

          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-neon-cyan animate-pulse"></span>
            <span className="text-sm font-medium text-slate-300">Trusted Electronics Store & Wholesale Supplier</span>
          </motion.div>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Digital World brings you the best range of TVs, Refrigerators, Washing Machines, Air Conditioners, Fans, Coolers, Kitchen Appliances, and Electronics from India's leading brands.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/catalog"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neon-cyan text-slate-950 font-bold text-lg hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] flex items-center justify-center space-x-2"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Contact Us</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Value Propositions */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
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
