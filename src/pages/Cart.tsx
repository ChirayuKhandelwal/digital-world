import { useAppContext } from "../context/AppContext";
import { Trash2, ShoppingBag, Plus, Minus, Tag, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { showAlert } from "../utils/alert";

export function Cart() {
  const { currentUser, removeFromCart, addToCart, deleteFromCart, placeOrder, discountSettings, coupons } = useAppContext();
  
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.mobile || "");
  const parseAddress = (addr: string) => {
    const parts = (addr || "").split('\n');
    if (parts.length >= 3) {
      // Assuming at least 3 parts for a somewhat structured address
      return { 
        houseNo: parts[0] || '', 
        landmark: parts.length === 4 ? parts[1] : '', 
        area: parts[parts.length === 4 ? 2 : 1] || '', 
        cityStatePincode: parts[parts.length === 4 ? 3 : 2] || '' 
      };
    }
    return { houseNo: addr, landmark: "", area: "", cityStatePincode: "" };
  };

  const extractPincode = (csp: string) => {
    const match = csp.match(/(\d{6})$/);
    if (match) {
      const pin = match[1];
      const rest = csp.replace(/[\s-]*\d{6}$/, '').trim();
      return { pin, rest };
    }
    return { pin: '', rest: csp };
  };

  const initialAddr = parseAddress(currentUser?.address || "");
  const extracted = extractPincode(initialAddr.cityStatePincode);

  const [houseNo, setHouseNo] = useState(initialAddr.houseNo);
  const [landmark, setLandmark] = useState(initialAddr.landmark);
  const [area, setArea] = useState(initialAddr.area);
  const [pincode, setPincode] = useState(extracted.pin);
  const [cityState, setCityState] = useState(extracted.rest);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  useEffect(() => {
    if (pincode.length === 6) {
      const fetchDetails = async () => {
        setIsFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await res.json();
          if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            setCityState(`${po.District}, ${po.State}`);
          }
        } catch (error) {
          console.error("Error fetching pincode details", error);
        } finally {
          setIsFetchingPincode(false);
        }
      };
      fetchDetails();
    }
  }, [pincode]);

  const [paymentMode, setPaymentMode] = useState<"Advance" | "Partial" | "COD">("Advance");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percentage: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const cartItems = currentUser?.cart || [];
  const baseTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Derived Pricing State
  const [pricing, setPricing] = useState({
    subtotal: 0,
    payment_discount: 0,
    coupon_discount: 0,
    final_total: 0,
    applied_payment_multiplier: 1
  });

  // Calculate whenever inputs change
  useEffect(() => {
    if (baseTotal === 0) return;

    const calculate = async () => {
      try {
        const res = await fetch('/api/calculate-total', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subtotal: baseTotal,
            payment_mode: paymentMode,
            coupon_code: appliedCoupon?.code,
            customer_id: currentUser?.id
          })
        });

        if (res.ok) {
          const data = await res.json();
          setPricing(data);
        } else {
          throw new Error('API failed, fallback to local');
        }
      } catch (e) {
        // Fallback for local development without proxy
        let multiplier = 1;
        if (discountSettings) {
          if (paymentMode === 'Advance') multiplier = discountSettings.advance_multiplier;
          if (paymentMode === 'Partial') multiplier = discountSettings.partial_multiplier;
          if (paymentMode === 'COD') multiplier = discountSettings.cod_multiplier;
        }
        
        const pDiscount = baseTotal * (1 - multiplier);
        let cTotal = baseTotal - pDiscount;
        let cDiscount = 0;

        if (appliedCoupon) {
          cDiscount = cTotal * (appliedCoupon.percentage / 100);
          cTotal -= cDiscount;
        }

        setPricing({
          subtotal: baseTotal,
          payment_discount: pDiscount,
          coupon_discount: cDiscount,
          final_total: cTotal,
          applied_payment_multiplier: multiplier
        });
      }
    };

    calculate();
  }, [baseTotal, paymentMode, appliedCoupon, discountSettings, currentUser]);

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCodeInput.trim()) return;

    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCodeInput, customer_id: currentUser?.id })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({ code: data.code, percentage: data.discount_percentage });
        setCouponCodeInput("");
      } else {
        setCouponError(data.error || "Invalid coupon");
      }
    } catch (e) {
      // Local fallback
      const found = coupons.find(c => c.code === couponCodeInput.toUpperCase() && c.is_active);
      if (found) {
        if (found.allowed_customer_ids?.length > 0 && !found.allowed_customer_ids.includes(currentUser?.id || '')) {
           setCouponError("You are not eligible for this coupon.");
        } else {
           setAppliedCoupon({ code: found.code, percentage: found.discount_percentage });
           setCouponCodeInput("");
        }
      } else {
        setCouponError("Invalid or expired coupon.");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-midnight mb-4">Your Cart is Empty</h2>
        <p className="text-coolgrey mb-8">Please log in to view your cart.</p>
        <Link to="/login" className="px-6 py-3 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-colors shadow-md shadow-electric/20">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-midnight mb-8 flex items-center gap-3">
        <ShoppingBag className="w-10 h-10 text-electric" />
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-black/5">
          <p className="text-xl text-coolgrey mb-6">Your cart is currently empty.</p>
          <Link to="/#catalog" className="px-6 py-3 bg-electric hover:bg-electric/90 text-white font-medium rounded-xl transition-all shadow-md shadow-electric/20 inline-block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <motion.div 
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl bg-gray-100" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-midnight">{item.product.name}</h3>
                  <p className="text-electric font-medium">₹{item.product.price.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-coolgrey hover:text-midnight hover:bg-gray-200 rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-midnight">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item.product)}
                        className="p-1 text-coolgrey hover:text-midnight hover:bg-gray-200 rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteFromCart(item.product.id)}
                  className="p-3 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-xl transition-all border border-red-100"
                  aria-label="Remove completely"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-black/5 h-fit sticky top-24">
            <h2 className="text-2xl font-bold text-midnight mb-6">Order Summary</h2>
            
            {/* Payment Mode Selector */}
            <div className="mb-6 space-y-3">
              <h3 className="text-midnight font-bold">Payment Method</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['Advance', 'Partial', 'COD'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-1 text-sm font-medium rounded-lg border transition-all ${paymentMode === mode ? 'border-electric bg-electric/10 text-electric' : 'border-gray-200 text-coolgrey hover:border-gray-300'}`}
                  >
                    {mode}
                    {discountSettings && mode === 'Advance' && discountSettings.advance_multiplier < 1 && (
                      <span className="block text-xs font-bold mt-1 text-green-500">Save {((1 - discountSettings.advance_multiplier) * 100).toFixed(0)}%</span>
                    )}
                    {discountSettings && mode === 'Partial' && discountSettings.partial_multiplier < 1 && (
                      <span className="block text-xs font-bold mt-1 text-green-500">Save {((1 - discountSettings.partial_multiplier) * 100).toFixed(0)}%</span>
                    )}
                    {discountSettings && mode === 'COD' && discountSettings.cod_multiplier < 1 && (
                      <span className="block text-xs font-bold mt-1 text-green-500">Save {((1 - discountSettings.cod_multiplier) * 100).toFixed(0)}%</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Coupon Code" 
                  value={couponCodeInput}
                  onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors disabled:opacity-50"
                />
                {!appliedCoupon ? (
                  <button 
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-midnight text-white text-sm font-bold rounded-xl hover:bg-midnight/90 transition-colors"
                  >
                    Apply
                  </button>
                ) : (
                  <button 
                    onClick={() => { setAppliedCoupon(null); setCouponError(""); }}
                    className="px-4 py-2 bg-red-50 text-red-500 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
              {appliedCoupon && <p className="text-green-600 text-xs mt-2 font-bold flex items-center gap-1"><Tag className="w-3 h-3"/> {appliedCoupon.code} applied! (-{appliedCoupon.percentage}%)</p>}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-coolgrey text-sm">
                <span>Subtotal</span>
                <span>₹{pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-coolgrey text-sm">
                <span>Shipping</span>
                <span className="text-electric font-medium">Free</span>
              </div>
              {pricing.payment_discount !== 0 && (
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className={pricing.payment_discount > 0 ? "text-green-600" : "text-red-500"}>
                    {pricing.payment_discount > 0 ? `Payment Discount (${paymentMode})` : `Payment Fee (${paymentMode})`}
                  </span>
                  <span className={pricing.payment_discount > 0 ? "text-green-600" : "text-red-500"}>
                    {pricing.payment_discount > 0 ? '-' : '+'}₹{Math.abs(pricing.payment_discount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
              {pricing.coupon_discount > 0 && (
                <div className="flex justify-between items-center text-green-600 text-sm font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{pricing.coupon_discount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 text-xl font-bold text-midnight">
              <span>Total</span>
              <span className="text-electric flex items-center gap-2">
                <Calculator className="w-5 h-5 text-coolgrey/50" />
                ₹{pricing.final_total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            
            <div className="space-y-4 mb-6">
              <h3 className="text-midnight font-bold mb-2">Customer Details</h3>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
              />
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="House No. / Flat No." 
                  value={houseNo} 
                  onChange={e => setHouseNo(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                />
                <input 
                  type="text" 
                  placeholder="Landmark (Optional)" 
                  value={landmark} 
                  onChange={e => setLandmark(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                />
                <input 
                  type="text" 
                  placeholder="Area / Locality" 
                  value={area} 
                  onChange={e => setArea(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                />
                <div className="flex gap-3">
                  <div className="relative w-1/3">
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="Pincode" 
                      value={pincode} 
                      onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                    />
                    {isFetchingPincode && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-electric border-t-transparent rounded-full animate-spin"></div>}
                  </div>
                  <div className="w-2/3">
                    <input 
                      type="text" 
                      placeholder="City, State" 
                      value={cityState} 
                      onChange={e => setCityState(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!name || !email || !phone || !houseNo || !area || !cityState || !pincode) {
                  showAlert.error("Missing Details", "Please fill in all mandatory customer details including address and pincode.");
                  return;
                }
                const formattedAddress = [houseNo, landmark, area, `${cityState} - ${pincode}`]
                  .filter(Boolean)
                  .join('\n');

                placeOrder(
                  { name, email, phone, address: formattedAddress },
                  paymentMode,
                  pricing.final_total,
                  {
                    ...(appliedCoupon?.code ? { discountApplied: appliedCoupon.code } : {}),
                    discountAmount: pricing.coupon_discount,
                    paymentModeDiscount: pricing.payment_discount
                  }
                );
              }}
              className="w-full py-4 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-all shadow-md shadow-electric/20"
            >
              Order Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
