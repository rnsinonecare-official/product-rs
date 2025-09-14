// Mock chat service for when Vertex AI fails
const mockChatResponses = {
  // Dosa vs Idli
  'dosa idli': 'Idli is healthier than dosa. Idli is steamed (no oil), lower calories (40-50 per piece), easier to digest. Dosa uses oil, higher calories (100-150 per piece). Both are fermented and provide probiotics. Choose idli for weight loss, dosa for energy.',
  
  'dosa or idli': 'Idli is healthier than dosa. Idli is steamed (no oil), lower calories (40-50 per piece), easier to digest. Dosa uses oil, higher calories (100-150 per piece). Both are fermented and provide probiotics. Choose idli for weight loss, dosa for energy.',
  
  'health wise dosa or idli': 'Idli is healthier than dosa. Idli is steamed (no oil), lower calories (40-50 per piece), easier to digest. Dosa uses oil, higher calories (100-150 per piece). Both are fermented and provide probiotics. Choose idli for weight loss, dosa for energy.',
  
  // General nutrition questions
  'nutrition': 'Focus on balanced meals with proteins, complex carbs, healthy fats, and plenty of vegetables. Stay hydrated and eat regular meals.',
  
  'weight loss': 'For weight loss: eat protein with every meal, choose whole grains, include fiber-rich foods, control portions, stay hydrated, and maintain regular meal times.',
  
  'healthy food': 'Healthy foods include: leafy greens, fruits, whole grains, lean proteins, nuts, seeds, and legumes. Limit processed foods and added sugars.',
  
  // Default responses
  'hello': 'Hello! I\'m your nutrition assistant. I can help with food choices, meal planning, and health advice. What would you like to know?',
  
  'hi': 'Hi there! I\'m here to help with your nutrition and health questions. What can I assist you with today?',
  
  'thanks': 'You\'re welcome! Feel free to ask me any nutrition or health questions anytime.',
};

const generateMockChatResponse = async (message) => {
  console.log('🔄 Using mock chat service for:', message);
  
  const lowerMessage = message.toLowerCase();
  
  // Find matching response
  for (const [key, response] of Object.entries(mockChatResponses)) {
    if (lowerMessage.includes(key)) {
      console.log('✅ Mock chat response found for:', key);
      return response;
    }
  }
  
  // Default response for unmatched questions
  console.log('✅ Using default mock chat response');
  return 'I can help with nutrition questions about food choices, meal planning, and healthy eating. What specific topic would you like to know about?';
};

module.exports = {
  generateMockChatResponse
};