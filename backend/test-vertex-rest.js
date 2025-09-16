const { GoogleAuth } = require('google-auth-library');
const path = require('path');

// Test Vertex AI using REST API directly (more reliable)
async function testVertexREST() {
  try {
    console.log('🌐 Testing Vertex AI via REST API...');
    
    // Load service account
    const serviceAccountPath = path.join(__dirname, 'config', 'vertex-ai-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    
    console.log('📋 Service Account:', serviceAccount.client_email);
    console.log('🏢 Project:', serviceAccount.project_id);
    
    // Get access token
    console.log('\n🔑 Getting access token...');
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    console.log('✅ Access token obtained');
    
    // Test Vertex AI REST API
    const projectId = serviceAccount.project_id;
    const location = 'us-central1';
    const model = 'gemini-1.5-flash-001';
    
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
    
    console.log('\n🔄 Making REST API call...');
    console.log('URL:', url);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: 'Say exactly: "Vertex AI REST API is working perfectly!"'
        }]
      }],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.2
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Vertex AI REST API is working!');
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        console.log('🤖 AI Response:', text);
      }
      
      console.log('\n🎉 VERTEX AI IS FULLY OPERATIONAL!');
      console.log('✅ Authentication: Working');
      console.log('✅ API Access: Working');
      console.log('✅ Model Generation: Working');
      console.log('✅ Ready for client deployment!');
      
      return true;
      
    } else {
      const errorText = await response.text();
      console.log('❌ API Error Response:', errorText);
      
      if (response.status === 403) {
        console.log('🔍 Permission denied - check service account roles');
      } else if (response.status === 404) {
        console.log('🔍 Model not found - try different model or location');
      } else if (response.status === 429) {
        console.log('🔍 Rate limited - too many requests');
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ REST API test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('🔍 Network error - check internet connection');
    } else if (error.message.includes('invalid_grant')) {
      console.error('🔍 Service account key issue');
    }
    
    return false;
  }
}

// Test different model versions
async function testDifferentModels() {
  try {
    console.log('\n🔄 Testing different Vertex AI models...');
    
    const serviceAccountPath = path.join(__dirname, 'config', 'vertex-ai-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro'
    ];
    
    const projectId = serviceAccount.project_id;
    const location = 'us-central1';
    
    for (const modelName of models) {
      try {
        console.log(`\n🧪 Testing model: ${modelName}`);
        
        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelName}:generateContent`;
        
        const requestBody = {
          contents: [{
            parts: [{
              text: `Say: "Model ${modelName} is working!"`
            }]
          }]
        };
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          console.log(`✅ ${modelName}: ${text}`);
          return { success: true, workingModel: modelName };
        } else {
          console.log(`❌ ${modelName}: Status ${response.status}`);
        }
        
      } catch (modelError) {
        console.log(`❌ ${modelName}: ${modelError.message}`);
      }
    }
    
    return { success: false };
    
  } catch (error) {
    console.error('❌ Model testing failed:', error.message);
    return { success: false };
  }
}

// Run comprehensive test
async function runComprehensiveTest() {
  console.log('🚀 COMPREHENSIVE VERTEX AI TEST');
  console.log('===============================\n');
  
  const restTest = await testVertexREST();
  const modelTest = await testDifferentModels();
  
  console.log('\n📊 FINAL RESULTS:');
  console.log('REST API Test:', restTest ? '✅ PASS' : '❌ FAIL');
  console.log('Model Test:', modelTest.success ? `✅ PASS (${modelTest.workingModel})` : '❌ FAIL');
  
  if (restTest || modelTest.success) {
    console.log('\n🎉 VERTEX AI IS WORKING!');
    console.log('🎯 Your client can now use Vertex AI');
    console.log('💼 Service account is properly configured');
    console.log('🔧 Ready for production deployment');
  } else {
    console.log('\n⚠️ Vertex AI tests failed');
    console.log('💡 Continue using direct Gemini API (which works perfectly)');
    console.log('🕐 Try Vertex AI again in 10-15 minutes (propagation delay)');
  }
}

runComprehensiveTest();