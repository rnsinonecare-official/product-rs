const { GoogleAuth } = require('google-auth-library');
const path = require('path');

// Check what Vertex AI APIs and models are available
async function checkVertexAPIs() {
  try {
    console.log('🔍 Checking Vertex AI API availability...');
    
    const serviceAccountPath = path.join(__dirname, 'config', 'vertex-ai-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    console.log('✅ Authentication successful');
    
    const projectId = serviceAccount.project_id;
    
    // Test 1: Check if Vertex AI API is enabled
    console.log('\n🔍 Test 1: Checking Vertex AI API status...');
    
    const apiUrl = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/aiplatform.googleapis.com`;
    
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ Vertex AI API status:', apiData.state);
      
      if (apiData.state === 'ENABLED') {
        console.log('✅ Vertex AI API is properly enabled');
      } else {
        console.log('❌ Vertex AI API is not enabled');
        console.log('💡 Enable it at: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com');
      }
    } else {
      console.log('❌ Could not check API status:', apiResponse.status);
    }
    
    // Test 2: List available locations
    console.log('\n🔍 Test 2: Checking available locations...');
    
    const locationsUrl = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations`;
    
    const locationsResponse = await fetch(locationsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      console.log('✅ Available locations:');
      locationsData.locations?.forEach(location => {
        console.log(`  - ${location.name} (${location.displayName})`);
      });
    } else {
      console.log('❌ Could not list locations:', locationsResponse.status);
    }
    
    // Test 3: Try different regions
    console.log('\n🔍 Test 3: Testing different regions...');
    
    const regions = ['us-central1', 'us-east1', 'europe-west1', 'asia-southeast1'];
    
    for (const region of regions) {
      try {
        console.log(`\n🌍 Testing region: ${region}`);
        
        const modelUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-pro:generateContent`;
        
        const testResponse = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Hello'
              }]
            }]
          })
        });
        
        console.log(`  Status: ${testResponse.status} (${testResponse.statusText})`);
        
        if (testResponse.ok) {
          console.log(`✅ ${region} is working!`);
          const data = await testResponse.json();
          console.log(`  Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text}`);
          return { success: true, workingRegion: region };
        } else if (testResponse.status === 403) {
          console.log(`  🔒 ${region}: Permission denied`);
        } else if (testResponse.status === 404) {
          console.log(`  ❌ ${region}: Model not found`);
        } else {
          const errorText = await testResponse.text();
          console.log(`  ❌ ${region}: ${errorText.substring(0, 100)}...`);
        }
        
      } catch (regionError) {
        console.log(`  ❌ ${region}: ${regionError.message}`);
      }
    }
    
    // Test 4: Check billing
    console.log('\n🔍 Test 4: Checking billing status...');
    
    const billingUrl = `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`;
    
    const billingResponse = await fetch(billingUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (billingResponse.ok) {
      const billingData = await billingResponse.json();
      if (billingData.billingEnabled) {
        console.log('✅ Billing is enabled');
        console.log('💳 Billing account:', billingData.billingAccountName);
      } else {
        console.log('❌ Billing is not enabled');
        console.log('💡 Enable billing at: https://console.cloud.google.com/billing');
      }
    } else {
      console.log('❌ Could not check billing status:', billingResponse.status);
    }
    
    return { success: false };
    
  } catch (error) {
    console.error('❌ API check failed:', error.message);
    return { success: false };
  }
}

// Main execution
async function main() {
  console.log('🚀 VERTEX AI DIAGNOSTIC REPORT');
  console.log('==============================\n');
  
  const result = await checkVertexAPIs();
  
  console.log('\n📋 DIAGNOSTIC SUMMARY:');
  console.log('======================');
  
  if (result.success) {
    console.log('🎉 Vertex AI is working in region:', result.workingRegion);
    console.log('✅ Ready for client deployment');
  } else {
    console.log('⚠️ Vertex AI setup needs attention');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Ensure Vertex AI API is enabled');
    console.log('2. Check billing is properly configured');
    console.log('3. Wait 10-15 minutes for propagation');
    console.log('4. Try different regions');
    console.log('');
    console.log('💡 MEANWHILE: Your direct Gemini API works perfectly!');
    console.log('   Continue using it while Vertex AI propagates.');
  }
}

main();