// Test the actual food analysis API endpoint
const express = require('express');
const request = require('supertest');

// Create a simple test to call the food analysis endpoint
async function testFoodAPI() {
  try {
    console.log('🧪 Testing food analysis API endpoint...');
    
    // Import the AI routes
    const aiRoutes = require('./src/routes/ai');
    const app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = { uid: 'test-user' };
      next();
    });
    
    app.use('/api/ai', aiRoutes);
    
    // Test the food analysis endpoint
    const response = await request(app)
      .post('/api/ai/analyze-food-name')
      .send({
        foodName: 'dosa',
        healthConditions: []
      });
    
    console.log('✅ Food API Response Status:', response.status);
    console.log('✅ Food API Response:', response.body);
    
    // Check if it's real AI data or fallback
    if (response.body.data && response.body.data.calories !== "Unable to analyze") {
      console.log('🎉 REAL AI DATA - Vertex AI is working!');
    } else {
      console.log('⚠️ FALLBACK DATA - Vertex AI failed, using mock service');
    }
    
  } catch (error) {
    console.error('❌ Food API test failed:', error.message);
  }
}

testFoodAPI();