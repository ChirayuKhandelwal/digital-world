import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
    <div className="relative overflow-hidden w-full max-w-[100vw] pt-20 pb-16 lg:pt-32 lg:pb-24 m-0 box-border">
      {/* Abstract background blobs (additional to Layout for Hero specifically) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-gradient-to-r from-blue-400/10 to-indigo-400/10 blur-[100px] -z-10 rounded-full opacity-70" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 box-border m-0 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1 
            variants={itemVariants} 
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 text-midnight uppercase"
          >
            DIGITAL WORLD
          </motion.h1>

          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-electric/5 border border-electric/10 rounded-full px-4 py-1.5 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-electric animate-pulse"></span>
            <span className="text-sm font-medium text-midnight">Trusted Electronics Store & Wholesale Supplier</span>
          </motion.div>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-coolgrey mb-10 max-w-2xl mx-auto">
            Digital World brings you the best range of TVs, Refrigerators, Washing Machines, Air Conditioners, Fans, Coolers, Kitchen Appliances, and Electronics from India's leading brands.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/#catalog"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-electric text-white font-bold text-lg hover:bg-electric/90 transition-all shadow-lg shadow-electric/30 flex items-center justify-center space-x-2"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-gray-200 text-midnight font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <span>Contact Us</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
