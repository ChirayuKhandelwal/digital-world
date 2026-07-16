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
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 w-full max-w-[100vw] overflow-x-hidden box-border z-[1000] border-b border-gray-200 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 box-border">
        <div className="flex items-center justify-between h-24 py-4 w-full">
          {/* Mobile Nav Toggle & Logo */}
          <div className="flex items-center space-x-1 md:space-x-4 min-w-0 flex-shrink">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 text-coolgrey hover:text-midnight transition-colors shrink-0"
            >
              {isOpen ? <X className="w-7 h-7 sm:w-8 sm:h-8" /> : <Menu className="w-7 h-7 sm:w-8 sm:h-8" />}
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1.5 group min-w-0">
              <div className="p-1.5 bg-electric/10 rounded-lg group-hover:bg-electric/20 transition-colors shrink-0">
                <MonitorPlay className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-electric" />
              </div>
              <span className="font-bold text-sm sm:text-base md:text-xl tracking-tight text-midnight whitespace-nowrap">
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
                  "text-sm font-medium transition-colors hover:text-electric",
                  location.pathname === link.path || (location.pathname === '/' && link.path === '/#catalog' && location.hash === '#catalog')
                    ? "text-electric font-semibold"
                    : "text-coolgrey"
                )}
              >
                {link.name}
              </Link>
            ))}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {currentUser.role === 'admin' ? (
                  <Link to="/admin" className="text-sm font-medium text-electric hover:text-electric/80 transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/profile" className="text-sm font-medium text-coolgrey hover:text-electric transition-colors">
                      Profile
                    </Link>
                    <Link to="/cart" className="relative p-2 text-coolgrey hover:text-electric transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-electric rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-coolgrey hover:text-midnight transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 text-sm font-medium bg-electric hover:bg-electric/90 text-white rounded-xl transition-all shadow-md shadow-electric/20 inline-block">
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="flex items-center space-x-2 md:hidden shrink-0">
            {currentUser ? (
              <>
                <Link to={currentUser.role === 'admin' ? "/admin" : "/cart"} className="relative p-2.5 text-coolgrey hover:text-electric transition-colors">
                  {currentUser.role === 'admin' ? <User className="w-7 h-7 sm:w-8 sm:h-8" /> : <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8" />}
                  {currentUser.role !== 'admin' && cartCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-electric rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2.5 text-coolgrey hover:text-midnight transition-colors"
                >
                  <LogOut className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="p-2.5 text-coolgrey hover:text-electric transition-colors">
                  <User className="w-7 h-7 sm:w-8 sm:h-8" />
                </Link>
                <Link to="/cart" className="relative p-2.5 text-coolgrey hover:text-electric transition-colors">
                  <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-electric rounded-full">
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
            className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    location.pathname === link.path || (location.pathname === '/' && link.path === '/#catalog' && location.hash === '#catalog')
                      ? "text-electric bg-gray-50"
                      : "text-coolgrey hover:text-midnight hover:bg-gray-50"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {currentUser && currentUser.role !== 'admin' && (
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    location.pathname === '/profile'
                      ? "text-electric bg-gray-50"
                      : "text-coolgrey hover:text-midnight hover:bg-gray-50"
                  )}
                >
                  Profile
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
