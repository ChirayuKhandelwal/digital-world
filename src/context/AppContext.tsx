import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { products as initialProducts, CATEGORY_LIST } from '../data/mockData';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';

export type Category = typeof CATEGORY_LIST[number];

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  image: string;
  specs: string[];
  featured?: boolean;
}
export type Role = 'customer' | 'admin';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: CartItem[];
  total: number;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  role: Role;
  cart: CartItem[];
}

interface AppContextType {
  // Product state
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Auth state
  users: User[];
  currentUser: User | null;
  register: (user: Omit<User, 'id' | 'role' | 'cart'>) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  deleteFromCart: (productId: string) => void;
  cartCount: number;

  // Order state
  orders: Order[];
  placeOrder: (customer: { name: string; email: string; phone: string }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // --- Products ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('digital_world_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return initialProducts; }
    }
    return initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('digital_world_products', JSON.stringify(products));
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...productData, id: `p-${Date.now()}` };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // --- Orders ---
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('digital_world_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('digital_world_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (!db) return; // Fallback to localStorage if no Firebase config

    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ ...doc.data(), id: doc.id } as Order);
      });
      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, []);

  // --- Users & Auth ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('digital_world_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('digital_world_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('digital_world_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('digital_world_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const register = (userData: Omit<User, 'id' | 'role' | 'cart'>) => {
    if (users.some(u => u.email === userData.email)) return false; // Email exists

    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      role: userData.email === 'admin@digitalworld.com' ? 'admin' : 'customer',
      cart: []
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser); // Auto login
    return true;
  };

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // --- Cart ---
  const addToCart = (product: Product) => {
    if (!currentUser) return;
    
    const updatedCart = [...currentUser.cart];
    const existingIndex = updatedCart.findIndex(item => item.product.id === product.id);
    
    if (existingIndex >= 0) {
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart.push({ product, quantity: 1 });
    }

    const updatedUser = { ...currentUser, cart: updatedCart };
    setCurrentUser(updatedUser);
    
    // Update user in users array to persist cart
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    setToastMessage("Item added to cart!");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const removeFromCart = (productId: string) => {
    if (!currentUser) return;
    
    const updatedCart = [...currentUser.cart];
    const existingIndex = updatedCart.findIndex(item => item.product.id === productId);
    
    if (existingIndex >= 0) {
      if (updatedCart[existingIndex].quantity > 1) {
        updatedCart[existingIndex].quantity -= 1;
      } else {
        updatedCart.splice(existingIndex, 1);
      }
    }

    const updatedUser = { ...currentUser, cart: updatedCart };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteFromCart = (productId: string) => {
    if (!currentUser) return;
    const updatedCart = currentUser.cart.filter(item => item.product.id !== productId);
    const updatedUser = { ...currentUser, cart: updatedCart };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const placeOrder = async (customer: { name: string; email: string; phone: string }) => {
    if (!currentUser || currentUser.cart.length === 0) return;
    
    const total = currentUser.cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const orderData = {
      userId: currentUser.id,
      customer,
      items: [...currentUser.cart],
      total,
      date: new Date().toISOString()
    };

    if (db) {
      try {
        await addDoc(collection(db, 'orders'), orderData);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      setOrders(prev => [{ ...orderData, id: `ord-${Date.now()}` }, ...prev]);
    }

    const updatedUser = { ...currentUser, cart: [] };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    setToastMessage("Order placed successfully!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const cartCount = currentUser?.cart.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <AppContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      users, currentUser, register, login, logout,
      addToCart, removeFromCart, deleteFromCart, cartCount,
      orders, placeOrder
    }}>
      {children}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[200] bg-slate-900/90 backdrop-blur-xl border border-neon-cyan/50 text-white px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(0,243,255,0.3)] flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-neon-cyan" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
