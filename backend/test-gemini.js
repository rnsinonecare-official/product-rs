// Load environment variables first
require('dotenv').config();

// Test script to check if regular Gemini service works
const geminiService = require('./src/services/geminiService');

async function testGemini() {
  try {
    console.log('🧪 Testing regular Gemini service...');
    const response = await geminiService.chatWithNutritionist('health wise dosa or idli wts better', {}, []);
    console.log('✅ Gemini service response:', response);
  } catch (error) {
    console.error('❌ Gemini service test failed:', error.message);
  }
}

testGemini();