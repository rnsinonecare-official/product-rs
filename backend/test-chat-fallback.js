// Test the new chat fallback system
const mockChatService = require('./src/services/mockChatService');

async function testChatFallback() {
  try {
    console.log('🧪 Testing chat fallback system...');
    
    const testMessages = [
      'health wise dosa or idli wts better',
      'nutrition advice',
      'weight loss tips',
      'hello'
    ];
    
    for (const message of testMessages) {
      console.log(`\n📝 Testing: "${message}"`);
      const response = await mockChatService.generateMockChatResponse(message);
      console.log(`✅ Response: ${response}`);
    }
    
  } catch (error) {
    console.error('❌ Chat fallback test failed:', error.message);
  }
}

testChatFallback();