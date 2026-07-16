import { db, auth } from '../firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const otpDoc = docs[0];
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

    // Ensure the user exists in the customers collection
    const customerRef = db.collection('customers').doc(userRecord.uid);
    const customerDoc = await customerRef.get();
    if (!customerDoc.exists) {
      await customerRef.set({
        email: email,
        name: email.split('@')[0], // default name
        role: 'customer',
        createdAt: new Date()
      });
    }

    // Generate Firebase Custom Token
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(200).json({ token: customToken });

  } catch (error) {
    console.error('verifyOTP Error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.toString() });
  }
}
