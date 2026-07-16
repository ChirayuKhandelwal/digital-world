import { db } from './firebaseAdmin.js';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
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
    
    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Save to Firestore
    await orderRef.update({
      deliveryOtp: otp,
      otpExpiry: expiry.toISOString()
    });

    // Send Email via Resend
    const customerEmail = orderData.customer?.email;
    if (customerEmail) {
      await resend.emails.send({
        from: 'Digital World Delivery <onboarding@resend.dev>',
        to: [customerEmail],
        subject: `Your Delivery OTP for Order #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0F172A;">Digital World Delivery</h2>
            <p>Your order is out for delivery! Please provide the following OTP to our delivery partner to securely receive your package.</p>
            <div style="background-color: #F8FAFC; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #6366F1; letter-spacing: 5px; margin: 0; font-size: 32px;">${otp}</h1>
            </div>
            <p style="color: #64748B; font-size: 14px;">This OTP will expire in 2 hours.</p>
            <p style="color: #64748B; font-size: 14px;">Do not share this code with anyone until you have received your package.</p>
          </div>
        `
      });
    }

    return res.status(200).json({ success: true, message: 'OTP generated and sent successfully' });
  } catch (error) {
    console.error('Error generating delivery OTP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
