import { db } from '../firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { subtotal, payment_mode, coupon_code, customer_id } = req.body;

  if (typeof subtotal !== 'number' || subtotal < 0) {
    return res.status(400).json({ error: 'Invalid subtotal.' });
  }

  try {
    // 1. Fetch Discount Settings
    const settingsRef = db.collection('discount_settings').doc('global');
    const settingsSnapshot = await settingsRef.get();
    
    let multipliers = {
      advance_multiplier: 1.0,
      partial_multiplier: 1.0,
      cod_multiplier: 1.0
    };

    if (settingsSnapshot.exists) {
      multipliers = { ...multipliers, ...settingsSnapshot.data() };
    }

    // Determine base multiplier from payment mode
    let baseMultiplier = 1.0;
    if (payment_mode === 'Advance') baseMultiplier = multipliers.advance_multiplier;
    else if (payment_mode === 'Partial') baseMultiplier = multipliers.partial_multiplier;
    else if (payment_mode === 'COD') baseMultiplier = multipliers.cod_multiplier;

    // Apply base multiplier first
    const paymentDiscountAmount = subtotal * (1 - baseMultiplier);
    let currentTotal = subtotal - paymentDiscountAmount;
    
    // 2. Validate and Apply Manual Coupon (if provided)
    let couponDiscountPercentage = 0;
    let couponDiscountAmount = 0;
    
    if (coupon_code) {
      const couponsRef = db.collection('coupons');
      const couponSnapshot = await couponsRef.where('code', '==', coupon_code.toUpperCase()).limit(1).get();

      if (!couponSnapshot.empty) {
        const coupon = couponSnapshot.docs[0].data();
        let isValid = true;
        
        if (!coupon.is_active) isValid = false;
        
        if (isValid && coupon.allowed_customer_ids && Array.isArray(coupon.allowed_customer_ids) && coupon.allowed_customer_ids.length > 0) {
          if (!customer_id || !coupon.allowed_customer_ids.includes(customer_id)) {
             isValid = false;
          }
        }
        
        if (isValid) {
          couponDiscountPercentage = coupon.discount_percentage || 0;
          // Apply manual coupon on top of the already discounted total
          couponDiscountAmount = currentTotal * (couponDiscountPercentage / 100);
          currentTotal -= couponDiscountAmount;
        }
      }
    }

    res.status(200).json({
      subtotal,
      payment_discount: paymentDiscountAmount,
      coupon_discount: couponDiscountAmount,
      final_total: currentTotal,
      applied_payment_multiplier: baseMultiplier,
      applied_coupon_percentage: couponDiscountPercentage
    });

  } catch (error) {
    console.error('Calculate Total Error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.toString() });
  }
}
