// Test script to check if the chat function works
const vertexAIService = require('./src/services/vertexAIGenAIService');

async function testChat() {
  try {
    console.log('🧪 Testing chat function...');
    const response = await vertexAIService.generateSimpleChatResponse('health wise dosa or idli wts better');
    console.log('✅ Chat response:', response);
  } catch (error) {
    console.error('❌ Chat test failed:', error.message);
    console.error('Full error:', error);
  }
}

testChat();