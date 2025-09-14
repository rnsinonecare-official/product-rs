// Simple test to verify Gemini API key format and basic connectivity

const serviceAccount = {
  "type": "service_account",
  "project_id": "rainscare",
  "private_key_id": "1526acee13a187c790d6611b070cb56d769e6599",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCcbk1Rtm0H0IPJ\nB+rLcYtXPhtHjdLtKYdduJbx7pKWYkWG4edrpli4WNTvi5qtmEcicfbILaxPbieB\ng2BvQM69ZHszgQQYnC+e2y3YZ04C+maXgbpoZT1KbUxZqI6EKmBRUJLSCoMH/5Rj\nYMitRjnLmlQ3Db6YPj+b4td8WYb4kwj7XUKHDAMr4jibA7mkaOyzN9hyXfdpTxvj\nIm0c+5eOzUa56p7ktQQpEqsGyY6KDuhGSsNLuyh9DBAOiavu+nwa3Jv5AJoN57yo\nLog6o/bYydhFLIVbcXmpjmpAl6AeCfPOGgMtnYlYhKvSMA5xmHTKNigA1Kbm0kAF\nZpPema9VAgMBAAECggEAAcmS3EL+MO+AKf0LVkLDCalTLM32jIYuc/LcKqyEA/A1\n2ioyTOfBg225v85JDgBmQ62ormCIjlR0YsWfsEsTHFU4a9Nmur9CHgm5bDZrTPET\n2K7/ScUVCQjXAqlAjksLqbIxffE9I7YXDyGieV8K4a7ZlSgfjDlzMZ1LGAfP2SmU\nXHbupZegeWBHYdvGp8a+dwwO/dIJLjzX7T/A3xBU5KDchoSOjeC1Sdixix0J7A7u\nmk9eGlEcc1usNrui8hTrTGTzmhR3K+zuC8xnkYioCgYE4NWLPtROPWpTR2mZ+33F\nS9OJ1ED4AOd/zpwVrZ/AUSqCTCO8uaPeBL/MPHjJcQKBgQDIIX8LNW7dWnuBpuM9\np26pL6a8lRYIw/OKDvtnNIFTh3HYfr7O7Izq0d+EfkAEkm34Kae5t7lcftozyZJ4\nFRFv7bkhY/hibwL5ckQ9qI4dWXbTQOilYQXOPf76FzU6RJTnbZ/a4PuHu1rSjcFQ\nh2wg5PqOwF9DH3ejeJLT+n5K/QKBgQDIGcDkPLk3BjCclUMfNf1QohlFnQBBDk1T\ndrRmbv02/pwMKDn5pGyHdaHIEtnASmjuUd0vLV/VEBm7/tIMk3myjrZs1v0xDG07\nwQOigg4Ey7YUgfvxK/k8LnVGqF8D35TM7X8BHOXV5glpyDOdXb9oJpapRMbp8hzL\nLMTTkfABOQKBgHHgNXUAS3win0JP3t/XJK2aUqrdvjLwpOQ60CySgMAxwsLoo9QE\nX87B6wht+ilf1LkvoqOXeh66g5iSKwivHEPvJbdtNgl0l2Gu9kuLXIowvN9KANcR\nlQcc2bgeeogUPBJPm3UlLZq3Ld+/D2+uDwXMpRGTPuFnx2C6G/oIf9JVAoGAYiS/\nhzKBZYuTrDlJgrVoWXQoEQzAYygwpQ9DzDoD2EVpJE1WoisTUB1SDF+yja3xaXKd\nmdYXetk6xgpl2+U5e2qj7x5DcRs3OGei8MH5PkDsPYLDn7aBuBLRUqaic7Plt92E\nvXb/A7qgQ1H+fuDMULkcjEk/ht9JYB3FLEAYB4ECgYB13pmmGAQ4LtjNm8YAG1hC\nHjMooZ+ZnncMqMUkTwHoj6QzMJfKGTzytiDWe+7dfw/6HKmevjzfj1bRx3/5lwgX\nZuCkhXB5h1wlkKilRAg7vcurzZopIvhIQ1RNQGwwdBT/NQczO4RTdUAx+2OBRiMN\nCpEJ80LhlJvHJPODzU0PqQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "rainscare@rainscare.iam.gserviceaccount.com",
  "client_id": "106806198507507353510",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/rainscare%40rainscare.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

function validateServiceAccount() {
  console.log('🔍 Validating service account structure...');
  
  // Check required fields
  const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields);
    return false;
  }
  
  console.log('✅ All required fields present');
  
  // Check private key format
  const privateKey = serviceAccount.private_key;
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
    console.error('❌ Invalid private key format');
    return false;
  }
  
  console.log('✅ Private key format looks correct');
  
  // Check email format
  if (!serviceAccount.client_email.includes('@') || !serviceAccount.client_email.includes('.iam.gserviceaccount.com')) {
    console.error('❌ Invalid service account email format');
    return false;
  }
  
  console.log('✅ Service account email format is valid');
  
  // Check project ID
  console.log('Project ID:', serviceAccount.project_id);
  console.log('Service Account Email:', serviceAccount.client_email);
  console.log('Private Key ID:', serviceAccount.private_key_id);
  
  return true;
}

async function testWithDirectAPIKey() {
  console.log('\n🔄 Note: For Gemini API, you typically need a direct API key, not a service account.');
  console.log('💡 To get a Gemini API key:');
  console.log('   1. Go to https://makersuite.google.com/app/apikey');
  console.log('   2. Create a new API key');
  console.log('   3. Use it directly with the Gemini SDK');
  console.log('');
  console.log('Example usage with API key:');
  console.log('const { GoogleGenerativeAI } = require("@google/generative-ai");');
  console.log('const genAI = new GoogleGenerativeAI("YOUR_API_KEY");');
  console.log('const model = genAI.getGenerativeModel({ model: "gemini-pro" });');
}

// Run validation
if (validateServiceAccount()) {
  console.log('\n🎉 Service account structure is valid!');
  console.log('⚠️  However, the JWT signature error suggests:');
  console.log('   1. The service account might be disabled/deleted');
  console.log('   2. The private key might be corrupted');
  console.log('   3. You might need a direct API key instead of service account');
  
  testWithDirectAPIKey();
} else {
  console.log('\n❌ Service account validation failed');
}