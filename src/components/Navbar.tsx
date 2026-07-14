import { Link, useLocation, useNavigate } from "react-router-dom";
import { MonitorPlay, Menu, X, LogOut, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, cartCount, logout } = useAppContext();

  const links = [
    { name: "Home", path: "/" },
    { name: "Catalog", path: "/catalog" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 w-full max-w-[100vw] overflow-x-hidden box-border z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 box-border">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Mobile Nav Toggle & Logo */}
          <div className="flex items-center space-x-1 md:space-x-4 min-w-0 flex-shrink">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white transition-colors shrink-0"
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1.5 group min-w-0">
              <div className="p-1.5 bg-neon-cyan/10 rounded-lg group-hover:bg-neon-cyan/20 transition-colors shrink-0">
                <MonitorPlay className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-neon-cyan" />
              </div>
              <span className="font-bold text-sm sm:text-base md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap">
                DIGITAL WORLD
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-neon-cyan",
                  location.pathname === link.path
                    ? "text-white"
                    : "text-slate-400"
                )}
              >
                {link.name}
              </Link>
            ))}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {currentUser.role === 'admin' ? (
                  <Link to="/admin" className="text-sm font-medium text-neon-cyan hover:text-cyan-400 transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/cart" className="relative p-2 text-slate-400 hover:text-neon-cyan transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950 bg-neon-cyan rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:border-neon-cyan/50 text-white inline-block">
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:hidden shrink-0">
            {currentUser ? (
              <>
                <Link to={currentUser.role === 'admin' ? "/admin" : "/cart"} className="relative p-1.5 text-slate-400 hover:text-neon-cyan transition-colors">
                  {currentUser.role === 'admin' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {currentUser.role !== 'admin' && cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-[10px] font-bold leading-none text-slate-950 bg-neon-cyan rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="p-1.5 text-slate-400 hover:text-neon-cyan transition-colors">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link to="/cart" className="relative p-1.5 text-slate-400 hover:text-neon-cyan transition-colors">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-[10px] font-bold leading-none text-slate-950 bg-neon-cyan rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-slate-900/80 backdrop-blur-xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    location.pathname === link.path
                      ? "text-neon-cyan bg-white/5"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
