import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { db, auth } from '../firebaseAdmin.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const OTP_EXPIRY_MINUTES = 5;
const RATE_LIMIT_MINUTES = 5;
const MAX_OTP_REQUESTS = 3;

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  try {
    const otpsRef = db.collection('otps');
    
    // Rate Limiting Check
    const fiveMinutesAgo = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
    const recentOTPsSnapshot = await otpsRef
      .where('email', '==', email)
      .get();

    let recentCount = 0;
    recentOTPsSnapshot.forEach(doc => {
      if (doc.data().createdAt.toDate() >= fiveMinutesAgo) {
        recentCount++;
      }
    });

    if (recentCount >= MAX_OTP_REQUESTS) {
      return res.status(429).json({ 
        error: `Too many requests. Please wait ${RATE_LIMIT_MINUTES} minutes before requesting another code.` 
      });
    }

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save to Firestore
    await otpsRef.add({
      email,
      code,
      createdAt: new Date(),
      expiresAt,
      used: false
    });

    try {
      await transporter.sendMail({
        from: `"Digital World" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Login Code',
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h2>Digital World Login</h2>
            <p>Your one-time password is:</p>
            <h1 style="font-size: 40px; letter-spacing: 5px; color: #3b82f6;">${code}</h1>
            <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Nodemailer Error:', error);
      return res.status(500).json({ error: 'Failed to send email.' });
    }

    res.status(200).json({ message: 'OTP sent successfully.' });

  } catch (error) {
    console.error('sendOTP Error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.toString() });
  }
}
