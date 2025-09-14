const { GoogleAuth } = require("google-auth-library");

const serviceAccountKey = {
  type: "service_account",
  project_id: "rainscare",
  private_key_id: "470a8e2e051d314b2ee239fe65d704c07fbe8ce2",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDNNvCSTUx8A7uU\niuEsW7GMXasGc5WPdvziY5kPo6aqVPLIdYVi6uOrT1W/W9Q0oDR8ULktcRCIIiRq\nNXN8f0Lf4EcNyDMwTK5tjQ8xbXWk9+QkmI3Rx5X07Ta8bBCl3JglH1RHa9xkht0d\naRWGwPD2ZjVoJEY+4nWZCjAqD2bfWAmHotGq8gEQvthiPTe9dSkHuVD4xXik+g0r\nbNu7o3bOP7jSR8M1yunumnl/Zm4RgI9rhmgy0MITxYve7Z52O150vv+iR0iNisTO\nvR9Zo6RSLhN2aLjTyul4xVahIf3BMdWA4zCsU2UHooZVqoNSxB+VQQTuZjZXyR1O\nbmEzkNbhAgMBAAECggEAAuZUFpxXgi5/68zDlKyHneFj8+xVsG66V40xodYw5tn0\nI69/btyjuQbrtTX1uDgMTc/9/qpvYdEQfSmCSn/QDaXkZlY0g10nnzfEGQsM9sOj\nwMptp8lypCczvXL0dqq4wdhUIn2foivPe4v01SmsR5SkDA1SxC6cghW+0ciHOyaQ\nXvZJuLmobGS7V3yLrCPEGtLGaoRmbJIz+y8nM1QImMCPBbBOpSZoyZhOohV4Y/gq\nR8nARrvuWLkeYDJeruDOiihjScVSJNVuqBcEXlKLmo3QkkRRXvvvSusj7zYvNz8T\n5T1Nuqo+Nl/8ChOXWY3UzvOHDPFtJQnjJhGuXmaiHQKBgQD1enjLQAorcm720J4z\nkhw1c2IhoMKQdHxXfo7B+Uh/x1vkNP2dDGEQSWNajqIfgbB138P2+bHgyalVBTwH\nkFILouBNpNmwHA8Te3QJRaK4gElDV57QiDEoZ/keCTuTlH1Jph/BZd10j6p6M/9v\nRrS4jZ9rME7lhdVxdr74Qv5qJQKBgQDWAqux9eutaM4YYeWTbRa7KQ8CM+rRQKtW\nAHtqKvOxWniT5lv02y3L4JjEPfZrVBmCX0j0l8lXER4Gd/Vg+ntHzK3SP5smM7Rr\n4/um+oaL5PaYVtOgsi/effhB80z7NznHvby2Qrj7pVH78VZsl9W/MTnZ25gLdNnQ\nQxpJQCG3DQKBgQDdNdp4vmLruBmKzYBi1L4a5Ll/uFDcwDv01JVs82mDzHFgeug4\niBlIBfpEdtheMA6GinkbrPPAr7mqZicsYb+twL8E+RM6gm6LjeqJGHmEbgaXavQw\n0yoJUXjKumM3oM4uekePjm48ReLIcOc0rbDZxrXscAIJD8vCjdGWAzklCQKBgQCL\nVqXPcpyGBUzalzLQcCByr2L0PjVPFNn5Xsr77wdHm+4R7dRFckc5DPyqGOXOL62E\nMuHfTsxqgdyYvZXoFG4b62npEDzF/Lgl3wRETa04fFUKDs4vPJTqOf5fgjfHAMgA\nAstRp9OlFJhyf0mT3q/ukfBmphEytFv0uxvsQXMyKQKBgQCoN2FkNWR6zu7AbTw4\nOSopsKPttVAjHu9i3/4v6vck1+pohWXaEZrkyDxDxzdgLqkfmNOJGFf3uzJ90N06\n71GH44pfBmrkkDYcaFCSb+dAZaFLQqHlTLtTB0m5fMHun/87BKosINoqyV/fhNuD\nNn9JgJKIyYiFDOktSbeMyoZ1Ew==\n-----END PRIVATE KEY-----\n",
  client_email: "vertex-ai-service-account@rainscare.iam.gserviceaccount.com",
  client_id: "115252254726125883897",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/vertex-ai-service-account%40rainscare.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

async function testVertexAuth() {
  try {
    console.log("🔑 Testing Vertex AI service account authentication...");

    // Test basic authentication
    const auth = new GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    console.log("✅ Authentication successful!");
    console.log("Project ID:", serviceAccountKey.project_id);
    console.log("Service Account:", serviceAccountKey.client_email);
    console.log("Token obtained:", !!accessToken.token);

    // Test API access
    const projectId = serviceAccountKey.project_id;
    const location = "us-central1";

    console.log("\n🔄 Testing Vertex AI API access...");

    const response = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models`,
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Vertex AI API accessible!");
      console.log("Available models:", data.models?.length || 0);

      if (data.models && data.models.length > 0) {
        console.log("First few models:");
        data.models.slice(0, 3).forEach((model) => {
          console.log(`  - ${model.name}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log(
        "❌ Vertex AI API response:",
        response.status,
        response.statusText
      );
      console.log("Error details:", errorText);

      if (response.status === 403) {
        console.log("\n💡 This usually means:");
        console.log("   1. Vertex AI API is not enabled");
        console.log("   2. Service account lacks permissions");
        console.log("   3. Billing is not set up");
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

console.log("🎯 Your Vertex AI service account key is ready to test!");
console.log("Service Account Email:", serviceAccountKey.client_email);
console.log("Project ID:", serviceAccountKey.project_id);
console.log("");

testVertexAuth();
