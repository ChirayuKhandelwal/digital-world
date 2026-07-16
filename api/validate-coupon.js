import { db } from '../firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, customer_id } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required.' });
  }

  try {
    const couponsRef = db.collection('coupons');
    const snapshot = await couponsRef.where('code', '==', code.toUpperCase()).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Invalid coupon code.' });
    }

    const couponDoc = snapshot.docs[0];
    const coupon = couponDoc.data();

    if (!coupon.is_active) {
      return res.status(400).json({ error: 'This coupon is inactive or expired.' });
    }

    if (coupon.allowed_customer_ids && Array.isArray(coupon.allowed_customer_ids) && coupon.allowed_customer_ids.length > 0) {
      if (!customer_id || !coupon.allowed_customer_ids.includes(customer_id)) {
        return res.status(403).json({ error: 'You are not eligible to use this coupon.' });
      }
    }

    res.status(200).json({ 
      valid: true,
      discount_percentage: coupon.discount_percentage,
      code: coupon.code
    });

  } catch (error) {
    console.error('Validate Coupon Error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.toString() });
  }
}
