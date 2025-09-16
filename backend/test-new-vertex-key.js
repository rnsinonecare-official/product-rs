const { GoogleAuth } = require('google-auth-library');
const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');

// Test the new Vertex AI service account key
async function testNewVertexKey() {
  try {
    console.log('🔑 Testing NEW Vertex AI service account key...');
    
    // Load the new service account
    const serviceAccountPath = path.join(__dirname, 'config', 'vertex-ai-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    
    console.log('📋 New Service Account Info:');
    console.log('  Project:', serviceAccount.project_id);
    console.log('  Email:', serviceAccount.client_email);
    console.log('  Key ID:', serviceAccount.private_key_id);
    
    // Test 1: Basic Authentication
    console.log('\n🔐 Test 1: Basic Authentication...');
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (accessToken.token) {
      console.log('✅ Authentication successful!');
      console.log('Token length:', accessToken.token.length);
    } else {
      throw new Error('Failed to get access token');
    }
    
    // Test 2: Vertex AI SDK
    console.log('\n🤖 Test 2: Vertex AI SDK...');
    const vertexAI = new VertexAI({
      project: serviceAccount.project_id,
      location: 'us-central1',
      keyFilename: serviceAccountPath
    });
    
    console.log('✅ Vertex AI SDK initialized');
    
    // Test 3: Model Access
    console.log('\n📱 Test 3: Model Access...');
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
    });
    
    console.log('✅ Model loaded successfully');
    
    // Test 4: Simple Generation
    console.log('\n🧠 Test 4: Simple Generation...');
    const result = await model.generateContent('Say exactly: "New Vertex AI key is working!"');
    const response = await result.response;
    const text = response.text();
    
    console.log('🎉 SUCCESS! Response:', text);
    
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('🚀 Your new Vertex AI service account key is working perfectly!');
    console.log('💼 Ready for client deployment with Vertex AI');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.error('🔍 JWT signature issue - key might still be invalid');
    } else if (error.message.includes('permission')) {
      console.error('🔍 Permission denied - check IAM roles');
    } else if (error.message.includes('billing')) {
      console.error('🔍 Billing issue - ensure billing is enabled');
    } else if (error.message.includes('quota')) {
      console.error('🔍 Quota exceeded - check API limits');
    } else if (error.message.includes('404')) {
      console.error('🔍 API not found - may need propagation time');
    }
    
    console.error('\n💡 If this is a new key, wait 5-10 minutes for propagation');
    
    return false;
  }
}

// Test with different approaches
async function testMultipleApproaches() {
  console.log('🧪 Testing multiple Vertex AI approaches...\n');
  
  const success1 = await testNewVertexKey();
  
  if (success1) {
    console.log('\n🎯 RESULT: Vertex AI is working with your new service account!');
    console.log('✅ You can now use Vertex AI for your client requirements');
    console.log('🔧 Implementation ready for production deployment');
  } else {
    console.log('\n⚠️ New key test failed. Possible reasons:');
    console.log('1. Key needs more time to propagate (wait 10-15 minutes)');
    console.log('2. API quotas or billing issues');
    console.log('3. Service account permissions need adjustment');
    console.log('\n💡 Your direct Gemini API is still working as backup!');
  }
}

testMultipleApproaches();