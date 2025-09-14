// Load environment variables
require("dotenv").config();

// Test if environment variables are loaded
console.log("🔍 Testing environment variables...");
console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "Found" : "Not found"
);
console.log(
  "API Key length:",
  process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
);
console.log(
  "API Key starts with:",
  process.env.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY.substring(0, 10) + "..."
    : "N/A"
);

// Test Gemini initialization
const { GoogleGenerativeAI } = require("@google/generative-ai");

if (process.env.GEMINI_API_KEY) {
  try {
    console.log("🔄 Initializing Gemini with API key...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("✅ Gemini initialized successfully");

    // Test a simple request
    console.log("🧪 Testing simple request...");
    model
      .generateContent("Say hello")
      .then((result) => {
        console.log("✅ Gemini response:", result.response.text());
      })
      .catch((error) => {
        console.error("❌ Gemini request failed:", error.message);
      });
  } catch (error) {
    console.error("❌ Gemini initialization failed:", error.message);
  }
} else {
  console.error("❌ No API key found");
}
