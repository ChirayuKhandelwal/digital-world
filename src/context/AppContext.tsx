import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { products as initialProducts, CATEGORY_LIST } from '../data/mockData';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, sendPasswordResetEmail, signInWithCustomToken } from 'firebase/auth';
import { showAlert } from '../utils/alert';

export type Category = typeof CATEGORY_LIST[number];

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  image: string;
  images?: string[];
  specs: string[];
  featured?: boolean;
  outOfStock?: boolean;
}
export type Role = 'owner' | 'admin' | 'staff' | 'customer';

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
  status: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  paymentStatus: 'Paid' | 'Pending' | 'COD';
  paymentMode?: 'Advance' | 'Partial' | 'COD';
  deliveryOtp?: string;
  otpExpiry?: string;
  discountApplied?: string;
  discountAmount?: number;
  paymentModeDiscount?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  allowed_customer_ids: string[];
  is_active: boolean;
}

export interface DiscountSettings {
  advance_multiplier: number;
  partial_multiplier: number;
  cod_multiplier: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address?: string;
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
  register: (userData: Omit<User, 'id' | 'role' | 'cart'>) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, code: string) => Promise<boolean>;
  
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  deleteFromCart: (productId: string) => void;
  cartCount: number;

  // Order state
  orders: Order[];
  placeOrder: (
    customer: { name: string; email: string; phone: string; address?: string },
    paymentMode?: string,
    finalTotal?: number,
    discountDetails?: { discountApplied?: string; discountAmount?: number; paymentModeDiscount?: number }
  ) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Coupons & Discounts
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<void>;
  updateCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  
  discountSettings: DiscountSettings | null;
  updateDiscountSettings: (settings: DiscountSettings) => Promise<void>;
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
        
        let role: Role = 'customer';
        if (firebaseUser.email === 'krishankhandelwal637@gmail.com') {
          role = 'owner';
        } else if (userData.role) {
          role = userData.role as Role;
        }

        setCurrentUser({
          id: firebaseUser.uid,
          name: userData.name || 'User',
          email: firebaseUser.email || '',
          mobile: userData.mobile || '',
          address: userData.address || '',
          role: role,
          cart: userData.cart || []
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const register = async (userData: Omit<User, 'id' | 'role' | 'cart'>): Promise<{ success: boolean; error?: string }> => {
    if (auth && db) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password || '');
        const firebaseUser = userCredential.user;
        const role = userData.email === 'krishankhandelwal637@gmail.com' ? 'owner' : 'customer';
        
        await setDoc(doc(db, 'customers', firebaseUser.uid), {
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          role: role,
          cart: [],
          registeredAt: new Date().toISOString()
        }, { merge: true });
        
        return { success: true };
      } catch (error: any) {
        console.error("Registration error:", error);
        return { success: false, error: error.code };
      }
    }
    return { success: false, error: 'auth/not-initialized' }; 
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
        const role = firebaseUser.email === 'krishankhandelwal637@gmail.com' ? 'owner' : 'customer';
        
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

  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (db && currentUser) {
      try {
        await setDoc(doc(db, 'customers', currentUser.id), updates, { merge: true });
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        return true;
      } catch (error) {
        console.error("Update profile error:", error);
        return false;
      }
    }
    return false;
  };

  const sendOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('sendOTP backend error:', res.status, errorData);
        return { success: false, error: errorData?.details || errorData?.error || 'Failed to send OTP' };
      }
      return { success: true };
    } catch (e) {
      console.error('sendOTP failed', e);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const verifyOTP = async (email: string, code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('verifyOTP backend error:', res.status, errorData);
        return false;
      }
      const { token } = await res.json();
      if (auth) {
        await signInWithCustomToken(auth, token);
        return true;
      }
      return false;
    } catch (e) {
      console.error('verifyOTP failed', e);
      return false;
    }
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

  const placeOrder = async (
    customer: { name: string; email: string; phone: string; address?: string },
    paymentMode?: string,
    finalTotal?: number,
    discountDetails?: { discountApplied?: string; discountAmount?: number; paymentModeDiscount?: number }
  ) => {
    console.log("placeOrder triggered with customer:", customer);
    
    if (!currentUser) {
      console.error("placeOrder aborted: No currentUser found.");
      return;
    }
    if (currentUser.cart.length === 0) {
      console.warn("placeOrder aborted: Cart is empty.");
      return;
    }
    
    const cartTotal = currentUser.cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const total = finalTotal !== undefined ? finalTotal : cartTotal;
    
    const orderData = {
      userId: currentUser.id,
      customer,
      items: [...currentUser.cart],
      total,
      date: new Date().toISOString(),
      status: 'Pending' as const,
      paymentStatus: 'Pending' as const,
      paymentMode: paymentMode || 'Advance',
      ...discountDetails
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

    showAlert.success("Success", "Order placed successfully!");
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

  // --- Coupons ---
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'coupons'), (querySnapshot) => {
      const fetched: Coupon[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ ...doc.data(), id: doc.id } as Coupon);
      });
      setCoupons(fetched);
    });
    return () => unsubscribe();
  }, []);

  const addCoupon = async (couponData: Omit<Coupon, 'id'>) => {
    if (db) await addDoc(collection(db, 'coupons'), couponData);
  };
  const updateCoupon = async (updated: Coupon) => {
    if (db) {
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'coupons', id), data);
    }
  };
  const deleteCoupon = async (id: string) => {
    if (db) await deleteDoc(doc(db, 'coupons', id));
  };

  // --- Discount Settings ---
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings | null>(null);
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(doc(db, 'discount_settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setDiscountSettings(docSnap.data() as DiscountSettings);
      } else {
        setDiscountSettings({ advance_multiplier: 1, partial_multiplier: 1, cod_multiplier: 1 });
      }
    });
    return () => unsubscribe();
  }, []);

  const updateDiscountSettings = async (settings: DiscountSettings) => {
    if (db) await setDoc(doc(db, 'discount_settings', 'global'), settings);
  };

  const cartCount = currentUser?.cart.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <AppContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      users, currentUser, register, login, loginWithGoogle, logout, resetPassword, updateUserProfile,
      sendOTP, verifyOTP,
      addToCart, removeFromCart, deleteFromCart, cartCount,
      orders, placeOrder, updateOrder, deleteOrder,
      coupons, addCoupon, updateCoupon, deleteCoupon,
      discountSettings, updateDiscountSettings
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
