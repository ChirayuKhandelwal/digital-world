import crypto from 'crypto';
import { Resend } from 'resend';
import { db, auth } from '../firebaseAdmin.js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Constants
const OTP_EXPIRY_MINUTES = 5;
const RATE_LIMIT_MINUTES = 5;
const MAX_OTP_REQUESTS = 3;

/**
 * Helper to generate a cryptographically secure 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendOTP = async (req, res) => {
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

    // Send email via Resend
    // Replace 'onboarding@resend.dev' with your verified domain if available
    const { data, error } = await resend.emails.send({
      from: 'Digital World <onboarding@resend.dev>',
      to: [email],
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

    if (error) {
      console.error('Resend Error:', error);
      return res.status(500).json({ error: 'Failed to send email.' });
    }

    res.status(200).json({ message: 'OTP sent successfully.' });

  } catch (error) {
    console.error('sendOTP Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  try {
    const otpsRef = db.collection('otps');
    
    // Find the latest unused OTP for this email
    const otpsSnapshot = await otpsRef
      .where('email', '==', email)
      .where('used', '==', false)
      .get();

    const docs = otpsSnapshot.docs.sort((a, b) => b.data().createdAt.toDate() - a.data().createdAt.toDate());

    if (docs.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const otpDoc = otpsSnapshot.docs[0];
    const otpData = otpDoc.data();

    // Check expiration
    if (otpData.expiresAt.toDate() < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check code match
    if (otpData.code !== code) {
      return res.status(400).json({ error: 'Incorrect OTP.' });
    }

    // Mark as used
    await otpDoc.ref.update({ used: true });

    // Ensure the user exists in Firebase Auth (or create them)
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({ email });
      } else {
        throw e;
      }
    }

    // Generate Firebase Custom Token
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(200).json({ token: customToken });

  } catch (error) {
    console.error('verifyOTP Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
