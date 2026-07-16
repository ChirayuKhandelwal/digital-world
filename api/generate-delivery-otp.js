import { db } from './firebaseAdmin.js';
import { Resend } from 'resend';
import crypto from 'crypto';
import { withRole } from './auth/middleware.js';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();
    
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    // Save to Firestore
    await orderRef.update({
      deliveryOtp: otp,
      otpExpiry: otpExpiry
    });

    // Send via Resend
    const customerEmail = orderData.customer?.email;
    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email not found on order' });
    }

    await resend.emails.send({
      from: 'Digital World <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Your Delivery OTP for Order #${orderId}`,
      html: `
        <h2>Your Delivery OTP</h2>
        <p>Please share this OTP with our delivery partner to securely receive your order.</p>
        <h1 style="letter-spacing: 5px; color: #6366F1;">${otp}</h1>
        <p>This code is valid for 15 minutes.</p>
      `
    });

    return res.status(200).json({ success: true, message: 'OTP generated and sent successfully' });
  } catch (error) {
    console.error('Error generating delivery OTP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withRole(['owner', 'admin', 'staff'], handler);
