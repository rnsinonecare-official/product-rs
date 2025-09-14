// Test script to check if food analysis works
const vertexAIService = require('./src/services/vertexAIGenAIService');

async function testFood() {
  try {
    console.log('🧪 Testing food analysis function...');
    const response = await vertexAIService.analyzeFoodByName('dosa', []);
    console.log('✅ Food analysis response:', response);
  } catch (error) {
    console.error('❌ Food analysis test failed:', error.message);
  }
}

testFood();