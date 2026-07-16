import { db, auth } from './firebaseAdmin.js';
import { withRole } from './auth/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { targetUserId, newRole } = req.body;
  if (!targetUserId || !newRole) {
    return res.status(400).json({ error: 'Target User ID and New Role are required' });
  }

  const validRoles = ['admin', 'staff', 'customer']; // Cannot promote to owner
  if (!validRoles.includes(newRole)) {
    return res.status(400).json({ error: 'Invalid role assignment' });
  }

  try {
    const targetUserRef = db.collection('customers').doc(targetUserId);
    const targetUserDoc = await targetUserRef.get();

    if (!targetUserDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUserData = targetUserDoc.data();

    // Security Constraint: Ensure that an 'owner' role can never be demoted
    // even by another owner (or by themselves via this endpoint).
    if (targetUserData.role === 'owner') {
      return res.status(403).json({ error: 'Forbidden: Cannot change the role of an owner.' });
    }

    // Update the role in Firestore
    await targetUserRef.update({
      role: newRole
    });

    return res.status(200).json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Only owners can access this endpoint
export default withRole(['owner'], handler);
