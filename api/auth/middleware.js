import { auth, db } from '../firebaseAdmin.js';

/**
 * Higher-Order Function wrapper for serverless APIs that enforces role-based access control.
 * @param {string[]} allowedRoles - Array of roles allowed to access this endpoint (e.g. ['owner', 'admin']).
 * @param {Function} handler - The actual API route handler.
 */
export const withRole = (allowedRoles, handler) => async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (err) {
      console.error('Error verifying Firebase ID token:', err);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const uid = decodedToken.uid;
    
    // Default the owner email explicitly to prevent lockouts
    let userRole = 'customer';
    if (decodedToken.email === 'krishankhandelwal637@gmail.com') {
      userRole = 'owner';
    } else {
      const userDoc = await db.collection('customers').doc(uid).get();
      if (userDoc.exists) {
        userRole = userDoc.data().role || 'customer';
      }
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role` });
    }

    // Attach user context to the request for the handler to use if needed
    req.user = { uid, email: decodedToken.email, role: userRole };

    // Proceed to the original handler
    return handler(req, res);
  } catch (error) {
    console.error('Middleware error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
