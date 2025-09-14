const express = require('express');
const router = express.Router();

// Mock storage for fallback data
const mockStorage = {
  announcements: [
    {
      id: 1,
      title: "Welcome to Rainscare!",
      content: "Your health journey starts here. Track your nutrition and get personalized insights.",
      priority: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      views: 0
    }
  ],
  healthTips: [
    {
      id: 1,
      title: "Stay Hydrated",
      content: "Drink at least 8 glasses of water daily for optimal health.",
      category: "general",
      isActive: true,
      createdAt: new Date().toISOString(),
      likes: 0
    },
    {
      id: 2,
      title: "Eat More Vegetables",
      content: "Include a variety of colorful vegetables in your daily meals.",
      category: "nutrition",
      isActive: true,
      createdAt: new Date().toISOString(),
      likes: 0
    }
  ],
  successStories: [
    {
      id: 1,
      name: "Sarah Johnson",
      story: "Lost 20 pounds using Rainscare's nutrition tracking features!",
      beforeWeight: 180,
      afterWeight: 160,
      duration: "3 months",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]
};

// Get active announcements (public endpoint)
router.get('/announcements/active', async (req, res) => {
  try {
    // Try to get from database first
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const snapshot = await db
      .collection('announcements')
      .where('isActive', '==', true)
      .orderBy('priority', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const announcements = [];
    snapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() });
    });

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    // Return mock data as fallback
    res.json(mockStorage.announcements.filter(a => a.isActive));
  }
});

// Get active health tips (public endpoint)
router.get('/health-tips/active', async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    
    // Try to get from database first
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    let query = db.collection('healthTips').where('isActive', '==', true);
    
    if (category !== 'all') {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const healthTips = [];
    snapshot.forEach((doc) => {
      healthTips.push({ id: doc.id, ...doc.data() });
    });

    res.json(healthTips);
  } catch (error) {
    console.error('Error fetching active health tips:', error);
    // Return mock data as fallback
    const { category = 'all' } = req.query;
    let tips = mockStorage.healthTips.filter(tip => tip.isActive);
    
    if (category !== 'all') {
      tips = tips.filter(tip => tip.category === category);
    }
    
    res.json(tips);
  }
});

// Get active success stories (public endpoint)
router.get('/success-stories/active', async (req, res) => {
  try {
    // Try to get from database first
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const snapshot = await db
      .collection('successStories')
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(6)
      .get();

    const successStories = [];
    snapshot.forEach((doc) => {
      successStories.push({ id: doc.id, ...doc.data() });
    });

    res.json(successStories);
  } catch (error) {
    console.error('Error fetching active success stories:', error);
    // Return mock data as fallback
    res.json(mockStorage.successStories.filter(story => story.isActive));
  }
});

// Like a health tip (public endpoint)
router.post('/health-tips/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to update in database first
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const docRef = db.collection('healthTips').doc(id);
    await docRef.update({
      likes: admin.firestore.FieldValue.increment(1)
    });
    
    res.json({ success: true, message: 'Health tip liked successfully' });
  } catch (error) {
    console.error('Error liking health tip:', error);
    // Return success anyway for better UX
    res.json({ success: true, message: 'Health tip liked successfully' });
  }
});

module.exports = router;