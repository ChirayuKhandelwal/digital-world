import { db } from './firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, otp } = req.body;
  if (!orderId || !otp) {
    return res.status(400).json({ error: 'Order ID and OTP are required' });
  }

  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();

    // Check if OTP matches
    if (!orderData.deliveryOtp || orderData.deliveryOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (orderData.otpExpiry && new Date(orderData.otpExpiry) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Mark as delivered and clear OTP fields
    await orderRef.update({
      status: 'Delivered',
      deliveryOtp: null,
      otpExpiry: null
    });

    return res.status(200).json({ success: true, message: 'Delivery verified successfully!' });
  } catch (error) {
    console.error('Error verifying delivery OTP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
