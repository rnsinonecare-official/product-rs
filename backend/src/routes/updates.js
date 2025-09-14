const express = require('express');
const router = express.Router();

// Get active updates (public endpoint)
router.get('/active', async (req, res) => {
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();

    // First try to get all updates, then filter
    const snapshot = await db.collection('updates').get();

    const updates = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive === true) {
        updates.push({ id: doc.id, ...data });
      }
    });

    // Sort by createdAt desc and limit to 10
    updates.sort((a, b) => {
      const aTime = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt || 0);
      const bTime = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt || 0);
      return bTime - aTime;
    });

    res.json(updates.slice(0, 10));
  } catch (error) {
    console.error('Error fetching active updates:', error);
    // Return empty array instead of error to allow fallback to quotes
    res.json([]);
  }
});

module.exports = router;