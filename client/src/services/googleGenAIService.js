// Google GenAI Service using Backend API
import api from './api';

// We'll use the backend API instead of connecting directly to Google's API
// This is more secure as it keeps the API key on the server side

/**
 * Generate content using Gemini 1.5 Pro model
 * @param {string} prompt - The prompt to send to the model
 * @returns {Promise<string>} - The generated text response
 */
export const generateContent = async (prompt) => {
  try {
    console.log('🤖 Generating content with Gemini 1.5 flash via backend');
    
    // Validate input
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error('Prompt is required and must be a non-empty string');
    }
    
    // Generate content using backend API
    const response = await api.post('/ai/generate-content', {
      prompt: prompt.trim(),
      model: 'gemini-1.5-flash'
    });
    
    // Handle different response structures
    return response.data?.data?.text || response.data?.text || response.data;
  } catch (error) {
    console.error('Error generating content with Gemini 1.5 flash:', error);
    throw new Error('Failed to generate content. Please try again later.');
  }
};

/**
 * Example function to demonstrate usage
 */
export const runExample = async () => {
  try {
    const response = await generateContent('Explain the benefits of a balanced diet in 3 bullet points');
    console.log('Generated response:', response);
    return response;
  } catch (error) {
    console.error('Error running example:', error);
    return 'Error running example';
  }
};

/**
 * Generate content with a structured prompt
 * @param {Object} params - Parameters for the structured prompt
 * @returns {Promise<string>} - The generated text response
 */
export const generateStructuredContent = async (params) => {
  try {
    console.log('🤖 Generating structured content with Gemini 1.5 Pro via backend');
    
    // Validate input
    if (!params || typeof params !== 'object') {
      throw new Error('Parameters object is required');
    }
    
    // Create a structured prompt
    const prompt = `
      Topic: ${params.topic || 'Health'}
      Format: ${params.format || 'Bullet points'}
      Length: ${params.length || 'Short'}
      Tone: ${params.tone || 'Informative'}
      
      ${params.prompt || 'Provide information on this topic.'}
    `.trim();
    
    // Generate content using backend API
    const response = await api.post('/ai/generate-content', {
      prompt,
      model: 'gemini-1.5-flash',
      structured: true,
      params
    });
    
    // Handle different response structures
    return response.data?.data?.text || response.data?.text || response.data;
  } catch (error) {
    console.error('Error generating structured content:', error);
    throw new Error('Failed to generate structured content. Please try again later.');
  }
};

// Export the service
const googleGenAIService = {
  generateContent,
  generateStructuredContent,
  runExample
};

export default googleGenAIService;