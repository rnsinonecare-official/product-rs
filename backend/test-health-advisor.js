// Load environment variables first
require('dotenv').config();

// Test the health advisor endpoint directly
const express = require('express');
const request = require('supertest');

async function testHealthAdvisor() {
  try {
    console.log('🧪 Testing health advisor endpoint...');
    
    // Import the health advisor routes
    const healthAdvisorRoutes = require('./src/routes/healthAdvisor');
    const app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = { uid: 'test-user' };
      next();
    });
    
    app.use('/api/health-advisor', healthAdvisorRoutes);
    
    // Test the chat endpoint
    const response = await request(app)
      .post('/api/health-advisor/chat')
      .send({
        message: 'health wise dosa or idli wts better'
      });
    
    console.log('✅ Health Advisor Response Status:', response.status);
    console.log('✅ Health Advisor Response:', response.body);
    
    if (response.body.data && response.body.data.response) {
      console.log('🎉 REAL AI RESPONSE:', response.body.data.response);
    }
    
  } catch (error) {
    console.error('❌ Health advisor test failed:', error.message);
  }
}

testHealthAdvisor();