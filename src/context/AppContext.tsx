import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { products as initialProducts, CATEGORY_LIST } from '../data/mockData';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';

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
    address?: string;
  };
  items: CartItem[];
  total: number;
  date: string;
  status: 'Pending' | 'Processing' | 'Delivered';
  paymentStatus: 'Paid' | 'Pending' | 'COD';
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
  register: (user: Omit<User, 'id' | 'role' | 'cart'>) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  deleteFromCart: (productId: string) => void;
  cartCount: number;

  // Order state
  orders: Order[];
  placeOrder: (customer: { name: string; email: string; phone: string; address?: string }) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
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

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'products'), (querySnapshot) => {
      const fetchedProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProducts.push({ ...doc.data(), id: doc.id } as Product);
      });
      if (fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
      }
    });
    return () => unsubscribe();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    if (db) {
      try {
        await addDoc(collection(db, 'products'), productData);
      } catch (e) {
        console.error("Error adding product: ", e);
      }
    } else {
      const newProduct: Product = { ...productData, id: `p-${Date.now()}` };
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    if (db) {
      try {
        const productRef = doc(db, 'products', updatedProduct.id);
        const { id, ...dataToUpdate } = updatedProduct;
        await updateDoc(productRef, dataToUpdate);
      } catch (e) {
        console.error("Error updating product: ", e);
      }
    } else {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    }
  };

  const deleteProduct = async (id: string) => {
    if (db && !id.startsWith('p-')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (e) {
        console.error("Error deleting product: ", e);
      }
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
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
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('digital_world_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('digital_world_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('digital_world_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData: Partial<User> = {
          name: firebaseUser.displayName || 'User',
          mobile: '',
          cart: []
        };
        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'customers', firebaseUser.uid));
            if (userDoc.exists()) {
              userData = userDoc.data() as Partial<User>;
            }
          } catch (e) {
            console.error("Error fetching customer data", e);
          }
        }
        
        setCurrentUser({
          id: firebaseUser.uid,
          name: userData.name || 'User',
          email: firebaseUser.email || '',
          mobile: userData.mobile || '',
          role: firebaseUser.email === 'krishankhandelwal637@gmail.com' ? 'admin' : 'customer',
          cart: userData.cart || []
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const register = async (userData: Omit<User, 'id' | 'role' | 'cart'>): Promise<boolean> => {
    if (auth && db) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password || '');
        const firebaseUser = userCredential.user;
        const role = userData.email === 'krishankhandelwal637@gmail.com' ? 'admin' : 'customer';
        
        await setDoc(doc(db, 'customers', firebaseUser.uid), {
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          role: role,
          cart: [],
          registeredAt: new Date().toISOString()
        }, { merge: true });
        
        return true;
      } catch (error) {
        console.error("Registration error:", error);
        return false;
      }
    }
    return false; 
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (auth && db) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        await setDoc(doc(db, 'customers', firebaseUser.uid), {
          email: firebaseUser.email,
          lastLogin: new Date().toISOString()
        }, { merge: true });
        
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    }
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    if (auth && db) {
      try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const firebaseUser = userCredential.user;
        const role = firebaseUser.email === 'krishankhandelwal637@gmail.com' ? 'admin' : 'customer';
        
        await setDoc(doc(db, 'customers', firebaseUser.uid), {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          role: role,
          lastLogin: new Date().toISOString()
        }, { merge: true });
        
        return true;
      } catch (error) {
        console.error("Google Auth error:", error);
        return false;
      }
    }
    return false;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return true;
      } catch (error) {
        console.error("Password reset error:", error);
        return false;
      }
    }
    return false;
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
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
    
    if (db) {
      setDoc(doc(db, 'customers', updatedUser.id), { cart: updatedCart }, { merge: true }).catch(console.error);
    }

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
    
    if (db) {
      setDoc(doc(db, 'customers', updatedUser.id), { cart: updatedCart }, { merge: true }).catch(console.error);
    }
  };

  const deleteFromCart = (productId: string) => {
    if (!currentUser) return;
    const updatedCart = currentUser.cart.filter(item => item.product.id !== productId);
    const updatedUser = { ...currentUser, cart: updatedCart };
    setCurrentUser(updatedUser);
    
    if (db) {
      setDoc(doc(db, 'customers', updatedUser.id), { cart: updatedCart }, { merge: true }).catch(console.error);
    }
  };

  const placeOrder = async (customer: { name: string; email: string; phone: string; address?: string }) => {
    console.log("placeOrder triggered with customer:", customer);
    
    if (!currentUser) {
      console.error("placeOrder aborted: No currentUser found.");
      return;
    }
    if (currentUser.cart.length === 0) {
      console.warn("placeOrder aborted: Cart is empty.");
      return;
    }
    
    const total = currentUser.cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const orderData = {
      userId: currentUser.id,
      customer,
      items: [...currentUser.cart],
      total,
      date: new Date().toISOString(),
      status: 'Pending' as const,
      paymentStatus: 'Pending' as const
    };
    
    console.log("Constructed order data:", orderData);

    if (db) {
      console.log("Firebase 'db' instance detected. Attempting to push to Firestore...");
      try {
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        console.log("Firebase success! Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("FIREBASE ERROR: Failed to add document to Firestore.", e);
        console.error("Hint: Check your Firestore Security Rules (they might be defaulting to 'allow read, write: if false;')");
      }
    } else {
      console.warn("Firebase 'db' instance NOT detected. Falling back to localStorage.");
      setOrders(prev => [{ ...orderData, id: `ord-${Date.now()}` }, ...prev]);
    }

    const updatedUser = { ...currentUser, cart: [] };
    setCurrentUser(updatedUser);
    
    if (db) {
      setDoc(doc(db, 'customers', updatedUser.id), { cart: [] }, { merge: true }).catch(console.error);
    }

    setToastMessage("Order placed successfully!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    if (db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), updates);
      } catch (error) {
        console.error("Error updating order:", error);
      }
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (db) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    } else {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const cartCount = currentUser?.cart.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <AppContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      users, currentUser, register, login, loginWithGoogle, logout,
      addToCart, removeFromCart, deleteFromCart, cartCount,
      orders, placeOrder, updateOrder, deleteOrder
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
