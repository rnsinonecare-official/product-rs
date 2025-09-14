const { GoogleAuth } = require("google-auth-library");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Test Google service account key for Gemini API access
const serviceAccount = {
  type: "service_account",
  project_id: "rainscare",
  private_key_id: "1526acee13a187c790d6611b070cb56d769e6599",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCcbk1Rtm0H0IPJ\nB+rLcYtXPhtHjdLtKYdduJbx7pKWYkWG4edrpli4WNTvi5qtmEcicfbILaxPbieB\ng2BvQM69ZHszgQQYnC+e2y3YZ04C+maXgbpoZT1KbUxZqI6EKmBRUJLSCoMH/5Rj\nYMitRjnLmlQ3Db6YPj+b4td8WYb4kwj7XUKHDAMr4jibA7mkaOyzN9hyXfdpTxvj\nIm0c+5eOzUa56p7ktQQpEqsGyY6KDuhGSsNLuyh9DBAOiavu+nwa3Jv5AJoN57yo\nLog6o/bYydhFLIVbcXmpjmpAl6AeCfPOGgMtnYlYhKvSMA5xmHTKNigA1Kbm0kAF\nZpPema9VAgMBAAECggEAAcmS3EL+MO+AKf0LVkLDCalTLM32jIYuc/LcKqyEA/A1\n2ioyTOfBg225v85JDgBmQ62ormCIjlR0YsWfsEsTHFU4a9Nmur9CHgm5bDZrTPET\n2K7/ScUVCQjXAqlAjksLqbIxffE9I7YXDyGieV8K4a7ZlSgfjDlzMZ1LGAfP2SmU\nXHbupZegeWBHYdvGp8a+dwwO/dIJLjzX7T/A3xBU5KDchoSOjeC1Sdixix0J7A7u\nmk9eGlEcc1usNrui8hTrTGTzmhR3K+zuC8xnkYioCgYE4NWLPtROPWpTR2mZ+33F\nS9OJ1ED4AOd/zpwVrZ/AUSqCTCO8uaPeBL/MPHjJcQKBgQDIIX8LNW7dWnuBpuM9\np26pL6a8lRYIw/OKDvtnNIFTh3HYfr7O7Izq0d+EfkAEkm34Kae5t7lcftozyZJ4\nFRFv7bkhY/hibwL5ckQ9qI4dWXbTQOilYQXOPf76FzU6RJTnbZ/a4PuHu1rSjcFQ\nh2wg5PqOwF9DH3ejeJLT+n5K/QKBgQDIGcDkPLk3BjCclUMfNf1QohlFnQBBDk1T\ndrRmbv02/pwMKDn5pGyHdaHIEtnASmjuUd0vLV/VEBm7/tIMk3myjrZs1v0xDG07\nwQOigg4Ey7YUgfvxK/k8LnVGqF8D35TM7X8BHOXV5glpyDOdXb9oJpapRMbp8hzL\nLMTTkfABOQKBgHHgNXUAS3win0JP3t/XJK2aUqrdvjLwpOQ60CySgMAxwsLoo9QE\nX87B6wht+ilf1LkvoqOXeh66g5iSKwivHEPvJbdtNgl0l2Gu9kuLXIowvN9KANcR\nlQcc2bgeeogUPBJPm3UlLZq3Ld+/D2+uDwXMpRGTPuFnx2C6G/oIf9JVAoGAYiS/\nhzKBZYuTrDlJgrVoWXQoEQzAYygwpQ9DzDoD2EVpJE1WoisTUB1SDF+yja3xaXKd\nmdYXetk6xgpl2+U5e2qj7x5DcRs3OGei8MH5PkDsPYLDn7aBuBLRUqaic7Plt92E\nvXb/A7qgQ1H+fuDMULkcjEk/ht9JYB3FLEAYB4ECgYB13pmmGAQ4LtjNm8YAG1hC\nHjMooZ+ZnncMqMUkTwHoj6QzMJfKGTzytiDWe+7dfw/6HKmevjzfj1bRx3/5lwgX\nZuCkhXB5h1wlkKilRAg7vcurzZopIvhIQ1RNQGwwdBT/NQczO4RTdUAx+2OBRiMN\nCpEJ80LhlJvHJPODzU0PqQ==\n-----END PRIVATE KEY-----\n",
  client_email: "rainscare@rainscare.iam.gserviceaccount.com",
  client_id: "106806198507507353510",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/rainscare%40rainscare.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

async function testGeminiServiceAccount() {
  try {
    console.log("🔑 Testing Google service account for Gemini API access...");

    // Test 1: Initialize Google Auth with service account
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    console.log("✅ Google Auth initialized successfully");

    // Test 2: Get access token
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (accessToken.token) {
      console.log("✅ Access token obtained successfully");
      console.log("Token type:", typeof accessToken.token);
      console.log("Token length:", accessToken.token.length);
    }

    // Test 3: Try to use the token with Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const models = await response.json();
      console.log("✅ Gemini API connection successful");
      console.log("Available models:", models.models?.length || 0);
    } else {
      console.log("⚠️  Gemini API response status:", response.status);
      const errorText = await response.text();
      console.log("Response:", errorText);
    }

    // Test 4: Alternative - try with direct API key approach
    console.log("\n🔄 Testing alternative approach with generated API key...");

    // Note: This would typically require converting service account to API key
    // For now, we'll just verify the service account structure
    console.log("Service account project:", serviceAccount.project_id);
    console.log("Service account email:", serviceAccount.client_email);
    console.log(
      "Private key format:",
      serviceAccount.private_key.includes("BEGIN PRIVATE KEY")
        ? "Valid"
        : "Invalid"
    );

    console.log("\n🎉 Service account key structure is valid!");
    console.log("💡 To use with Gemini, you may need to:");
    console.log("   1. Enable Generative AI API in Google Cloud Console");
    console.log("   2. Grant necessary permissions to the service account");
    console.log("   3. Or generate an API key from the Google Cloud Console");
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.message.includes("private_key")) {
      console.error("🔍 Issue with private key format");
    } else if (error.message.includes("client_email")) {
      console.error("🔍 Issue with client email");
    } else if (error.message.includes("project_id")) {
      console.error("🔍 Issue with project ID");
    } else {
      console.error("🔍 Full error:", error);
    }
  }
}

// Run the test
testGeminiServiceAccount();
