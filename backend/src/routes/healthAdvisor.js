const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { limitTextInput } = require("../middleware/inputLimit");
const { db } = require("../config/firebase");
const geminiService = require("../services/geminiService");

const router = express.Router();

// Rate limiting for chat - 15 requests per hour
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Max 15 requests per hour
  message: {
    error: "Too many chat requests, please try again later.",
    retryAfter: "1 hour",
  },
});

/**
 * Get user data from database for RAG context
 */
const getUserDataForRAG = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get user profile, recent meals, and health data
    const [userDoc, recentMeals, healthMetrics] = await Promise.all([
      db.collection("users").doc(userId).get(),
      db
        .collection("foodDiary")
        .where("userId", "==", userId)
        .where("date", ">=", sevenDaysAgo)
        .orderBy("date", "desc")
        .limit(20)
        .get(),
      db
        .collection("healthMetrics")
        .where("userId", "==", userId)
        .where("date", ">=", sevenDaysAgo)
        .orderBy("date", "desc")
        .limit(10)
        .get(),
    ]);

    const userData = userDoc.exists ? userDoc.data() : {};

    const meals = [];
    recentMeals.forEach((doc) => {
      meals.push(doc.data());
    });

    const metrics = [];
    healthMetrics.forEach((doc) => {
      metrics.push(doc.data());
    });

    return {
      profile: {
        name: userData.name || "User",
        age: userData.age,
        gender: userData.gender,
        healthConditions: userData.healthConditions || [],
        dietType: userData.dietType || "vegetarian",
        fitnessGoal: userData.fitnessGoal,
        allergies: userData.allergies || [],
      },
      recentMeals: meals,
      healthMetrics: metrics,
      todayDate: today,
    };
  } catch (error) {
    console.error("Error getting user data for RAG:", error);
    return {
      profile: { name: "User", healthConditions: [] },
      recentMeals: [],
      healthMetrics: [],
      todayDate: new Date().toISOString().split("T")[0],
    };
  }
};

/**
 * Generate health advisor response - LIMITED TO 300-400 CHARACTERS
 */
const generateHealthAdvisorResponse = async (message, userData) => {
  try {
    console.log("🔄 Using Gemini service with character limits...");
    
    // Create a custom prompt that enforces character limits
    const limitedPrompt = `You are a nutrition expert. Answer this health question in EXACTLY 300-400 characters (including spaces). Be concise but helpful: "${message}"`;
    
    // Use Gemini directly with character limit
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 100, // Limit tokens to keep response short
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });
    
    const result = await model.generateContent(limitedPrompt);
    const response = result.response.text();
    
    // Ensure response is within 300-400 character limit
    let limitedResponse = response.trim();
    if (limitedResponse.length > 400) {
      limitedResponse = limitedResponse.substring(0, 397) + "...";
    } else if (limitedResponse.length < 300) {
      // If too short, add helpful closing
      limitedResponse += " For more detailed advice, consult a nutritionist.";
      if (limitedResponse.length > 400) {
        limitedResponse = limitedResponse.substring(0, 397) + "...";
      }
    }
    
    console.log(`✅ Gemini response (${limitedResponse.length} chars):`, limitedResponse);
    return limitedResponse;
  } catch (error) {
    console.error("❌ Gemini chat error:", error);
    return "Sorry, I'm having trouble right now. Please try again later for nutrition advice.";
  }
};

/**
 * @route   POST /api/health-advisor/chat
 * @desc    Simple Health Advisor - send everything to Gemini
 * @access  Private
 */
router.post(
  "/chat",
  chatLimiter,
  limitTextInput(500), // 500 character input limit
  [body("message").notEmpty().withMessage("Message is required")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "ValidationError",
        message: errors
          .array()
          .map((err) => err.msg)
          .join(", "),
      });
    }

    const { message } = req.body;
    const userId = req.user.uid;

    try {
      console.log("🤖 Health Advisor Chat Request:", message);

      // Get user data from database
      const userData = await getUserDataForRAG(userId);

      // Send everything to Gemini - no restrictions
      const response = await generateHealthAdvisorResponse(message, userData);

      res.json({
        success: true,
        data: {
          response,
          timestamp: new Date().toISOString(),
        },
        message: "Health advisor response generated successfully",
      });
    } catch (error) {
      console.error("Health advisor chat error:", error);

      res.json({
        success: true,
        data: {
          response:
            "I'm sorry, I'm having technical difficulties. Please try asking your question again, or consult with a healthcare professional for personalized advice.",
          timestamp: new Date().toISOString(),
        },
        message: "Fallback response provided",
      });
    }
  })
);

module.exports = router;
