const { VertexAI } = require('@google-cloud/vertexai');

// Replace this with your new service account key
const serviceAccountKey = {
  "type": "service_account",
  "project_id": "rainscare",
  "private_key_id": "470a8e2e051d314b2ee239fe65d704c07fbe8ce2",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDNNvCSTUx8A7uU\niuEsW7GMXasGc5WPdvziY5kPo6aqVPLIdYVi6uOrT1W/W9Q0oDR8ULktcRCIIiRq\nNXN8f0Lf4EcNyDMwTK5tjQ8xbXWk9+QkmI3Rx5X07Ta8bBCl3JglH1RHa9xkht0d\naRWGwPD2ZjVoJEY+4nWZCjAqD2bfWAmHotGq8gEQvthiPTe9dSkHuVD4xXik+g0r\nbNu7o3bOP7jSR8M1yunumnl/Zm4RgI9rhmgy0MITxYve7Z52O150vv+iR0iNisTO\nvR9Zo6RSLhN2aLjTyul4xVahIf3BMdWA4zCsU2UHooZVqoNSxB+VQQTuZjZXyR1O\nbmEzkNbhAgMBAAECggEAAuZUFpxXgi5/68zDlKyHneFj8+xVsG66V40xodYw5tn0\nI69/btyjuQbrtTX1uDgMTc/9/qpvYdEQfSmCSn/QDaXkZlY0g10nnzfEGQsM9sOj\nwMptp8lypCczvXL0dqq4wdhUIn2foivPe4v01SmsR5SkDA1SxC6cghW+0ciHOyaQ\nXvZJuLmobGS7V3yLrCPEGtLGaoRmbJIz+y8nM1QImMCPBbBOpSZoyZhOohV4Y/gq\nR8nARrvuWLkeYDJeruDOiihjScVSJNVuqBcEXlKLmo3QkkRRXvvvSusj7zYvNz8T\n5T1Nuqo+Nl/8ChOXWY3UzvOHDPFtJQnjJhGuXmaiHQKBgQD1enjLQAorcm720J4z\nkhw1c2IhoMKQdHxXfo7B+Uh/x1vkNP2dDGEQSWNajqIfgbB138P2+bHgyalVBTwH\nkFILouBNpNmwHA8Te3QJRaK4gElDV57QiDEoZ/keCTuTlH1Jph/BZd10j6p6M/9v\nRrS4jZ9rME7lhdVxdr74Qv5qJQKBgQDWAqux9eutaM4YYeWTbRa7KQ8CM+rRQKtW\nAHtqKvOxWniT5lv02y3L4JjEPfZrVBmCX0j0l8lXER4Gd/Vg+ntHzK3SP5smM7Rr\n4/um+oaL5PaYVtOgsi/effhB80z7NznHvby2Qrj7pVH78VZsl9W/MTnZ25gLdNnQ\nQxpJQCG3DQKBgQDdNdp4vmLruBmKzYBi1L4a5Ll/uFDcwDv01JVs82mDzHFgeug4\niBlIBfpEdtheMA6GinkbrPPAr7mqZicsYb+twL8E+RM6gm6LjeqJGHmEbgaXavQw\n0yoJUXjKumM3oM4uekePjm48ReLIcOc0rbDZxrXscAIJD8vCjdGWAzklCQKBgQCL\nVqXPcpyGBUzalzLQcCByr2L0PjVPFNn5Xsr77wdHm+4R7dRFckc5DPyqGOXOL62E\nMuHfTsxqgdyYvZXoFG4b62npEDzF/Lgl3wRETa04fFUKDs4vPJTqOf5fgjfHAMgA\nAstRp9OlFJhyf0mT3q/ukfBmphEytFv0uxvsQXMyKQKBgQCoN2FkNWR6zu7AbTw4\nOSopsKPttVAjHu9i3/4v6vck1+pohWXaEZrkyDxDxzdgLqkfmNOJGFf3uzJ90N06\n71GH44pfBmrkkDYcaFCSb+dAZaFLQqHlTLtTB0m5fMHun/87BKosINoqyV/fhNuD\nNn9JgJKIyYiFDOktSbeMyoZ1Ew==\n-----END PRIVATE KEY-----\n",
  "client_email": "vertex-ai-service-account@rainscare.iam.gserviceaccount.com",
  "client_id": "115252254726125883897",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/vertex-ai-service-account%40rainscare.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

async function testVertexAI() {
  try {
    console.log('🔑 Testing Vertex AI with service account...');
    
    // Initialize Vertex AI with credentials directly
    const vertexAI = new VertexAI({
      project: serviceAccountKey.project_id,
      location: 'us-central1',
      googleAuthOptions: {
        credentials: serviceAccountKey
      }
    });

    console.log('✅ Vertex AI initialized successfully');
    
    // Test with different Gemini models
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro'
    ];

    let success = false;
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        
        const generativeModel = vertexAI.preview.getGenerativeModel({
          model: modelName,
        });

        console.log('✅ Generative model loaded');

        // Test a simple prompt
        const prompt = 'Hello, can you respond with "Vertex AI is working!"?';
        const result = await generativeModel.generateContent(prompt);
        
        console.log('✅ API call successful!');
        console.log('Model used:', modelName);
        console.log('Response:', result.response.candidates[0].content.parts[0].text);
        success = true;
        break;
        
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed:`, modelError.message.split('.')[0]);
        continue;
      }
    }
    
    if (!success) {
      throw new Error('All models failed - check project permissions and billing');
    }
    
  } catch (error) {
    console.error('❌ Vertex AI test failed:', error.message);
    
    if (error.message.includes('permission')) {
      console.error('🔍 Permission issue - check IAM roles');
    } else if (error.message.includes('project')) {
      console.error('🔍 Project issue - verify project ID');
    } else if (error.message.includes('quota')) {
      console.error('🔍 Quota exceeded - check billing/limits');
    }
  }
}

// Alternative: Test with environment variable approach
async function testWithEnvVar() {
  try {
    console.log('\n🔄 Testing with environment variable approach...');
    
    // Set the environment variable
    process.env.GOOGLE_APPLICATION_CREDENTIALS = './path-to-your-key.json';
    
    const vertexAI = new VertexAI({
      project: 'your-project-id',
      location: 'us-central1'
    });
    
    console.log('✅ Environment variable approach works');
    
  } catch (error) {
    console.error('❌ Environment variable test failed:', error.message);
  }
}

console.log('📋 Instructions to get your Vertex AI key:');
console.log('1. Go to https://console.cloud.google.com/');
console.log('2. Select your project');
console.log('3. Enable Vertex AI API');
console.log('4. Create service account with Vertex AI User role');
console.log('5. Download JSON key');
console.log('6. Replace the serviceAccountKey object above');
console.log('');

// Run the test
testVertexAI();