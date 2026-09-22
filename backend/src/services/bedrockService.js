/**
 * AI service backed by AWS Bedrock (Converse API) with a model fallback chain.
 * Drop-in replacement for the old geminiService.js — same function signatures
 * and return shapes. Primary model is Kimi K2.5; on Bedrock throttling/errors
 * it cascades down the chain. Text and image features use separate chains
 * (image chain contains only vision-capable models).
 */
const { ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
const { bedrock } = require("../config/aws");

require("dotenv").config();

const parseChain = (v, fallback) =>
  (v || fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const TEXT_CHAIN = parseChain(
  process.env.BEDROCK_TEXT_CHAIN,
  "moonshotai.kimi-k2.5,amazon.nova-pro-v1:0,deepseek.v3.2,mistral.mistral-large-3-675b-instruct,zai.glm-5"
);
const IMAGE_CHAIN = parseChain(
  process.env.BEDROCK_IMAGE_CHAIN,
  "moonshotai.kimi-k2.5,amazon.nova-pro-v1:0,mistral.mistral-large-3-675b-instruct"
);

const RETRYABLE = new Set([
  "ThrottlingException",
  "TooManyRequestsException",
  "ModelErrorException",
  "ServiceUnavailableException",
  "InternalServerException",
  "ModelTimeoutException",
  "ModelNotReadyException",
]);

function isRetryable(err) {
  if (!err) return false;
  if (RETRYABLE.has(err.name)) return true;
  const code = err.$metadata && err.$metadata.httpStatusCode;
  return code === 429 || (code >= 500 && code < 600);
}

/**
 * Run a Converse request against the chain, cascading on retryable errors.
 * Returns the concatenated text of the assistant message.
 */
async function converse({ chain, system, messages, maxTokens, temperature }) {
  let lastErr;
  for (const modelId of chain) {
    try {
      const res = await bedrock.send(
        new ConverseCommand({
          modelId,
          ...(system ? { system: [{ text: system }] } : {}),
          messages,
          inferenceConfig: {
            maxTokens,
            ...(temperature != null ? { temperature } : {}),
          },
        })
      );
      const blocks = (res.output && res.output.message && res.output.message.content) || [];
      const text = blocks
        .map((b) => b.text)
        .filter(Boolean)
        .join("");
      if (text && text.trim()) return text;
      lastErr = new Error(`Empty response from ${modelId}`);
    } catch (err) {
      lastErr = err;
      if (isRetryable(err)) {
        console.warn(`⚠️ Bedrock ${modelId} failed (${err.name}); falling back…`);
        continue;
      }
      console.error(`❌ Bedrock ${modelId} non-retryable error:`, err.name, err.message);
      throw err;
    }
  }
  throw lastErr || new Error("All Bedrock models failed");
}

const textMessage = (prompt) => [{ role: "user", content: [{ text: prompt }] }];

const imageFormatFromMime = (mime) => {
  if (!mime) return "jpeg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "jpeg";
};

function extractJson(text, kind) {
  let clean = text.trim().replace(/```json\s*/g, "").replace(/```\s*/g, "");
  const re = kind === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const match = clean.match(re);
  if (!match) throw new Error("No JSON found in model response");
  return JSON.parse(match[0]);
}

const HEALTH_GUIDE = `Health-condition guidance:
- DIABETES: focus on carbs, sugar content, glycemic index
- HYPERTENSION: focus on sodium content
- PCOS/PCOD: anti-inflammatory properties, sugar content
- THYROID: iodine content, goitrogenic foods
- WEIGHT MANAGEMENT: calorie density, satiety
Be specific about health recommendations based on the user's conditions.`;

// ---- analyzeFoodImage ------------------------------------------------------
const analyzeFoodImage = async (imageFile, userHealthConditions = []) => {
  const healthConditionsText = userHealthConditions.length
    ? `User has these health conditions: ${userHealthConditions.join(", ")}. `
    : "";
  const prompt = `Analyze this food image and provide a comprehensive nutritional analysis. ${healthConditionsText}

Respond with ONLY valid JSON in this exact format:
{
  "foodName": "Name of the food item",
  "calories": "Estimated calories per serving",
  "nutritionFacts": { "protein": "grams", "carbs": "grams", "fat": "grams", "fiber": "grams", "sugar": "grams", "sodium": "mg" },
  "servingSize": "Description of serving size",
  "healthScore": "1-10 rating",
  "isHealthy": true,
  "recommendation": "Overall recommendation",
  "healthWarnings": ["warnings based on health conditions"],
  "healthBenefits": ["benefits"],
  "suitableFor": ["conditions this food is good for"],
  "avoidIf": ["conditions that should avoid this food"],
  "alternatives": ["healthier alternatives if applicable"],
  "preparation": "How this food appears to be prepared",
  "ingredients": ["likely ingredients visible"]
}

${HEALTH_GUIDE}`;

  try {
    const messages = [
      {
        role: "user",
        content: [
          {
            image: {
              format: imageFormatFromMime(imageFile.mimetype),
              source: { bytes: imageFile.buffer },
            },
          },
          { text: prompt },
        ],
      },
    ];
    const text = await converse({
      chain: IMAGE_CHAIN,
      messages,
      maxTokens: 900,
      temperature: 0.5,
    });
    return extractJson(text, "object");
  } catch (error) {
    console.error("Error analyzing food image:", error.message);
    return {
      foodName: "Food Item",
      calories: "Unable to analyze",
      nutritionFacts: { protein: "0g", carbs: "0g", fat: "0g", fiber: "0g", sugar: "0g", sodium: "0mg" },
      servingSize: "1 serving",
      healthScore: 5,
      isHealthy: true,
      recommendation: "Unable to analyze image. Please try uploading a clearer photo.",
      healthWarnings: ["Image analysis failed"],
      healthBenefits: [],
      suitableFor: [],
      avoidIf: [],
      alternatives: [],
      preparation: "Unknown",
      ingredients: [],
    };
  }
};

// ---- generateHealthyRecipe -------------------------------------------------
const generateHealthyRecipe = async (
  ingredients,
  userHealthConditions = [],
  dietaryPreferences = {}
) => {
  const healthConditionsText = userHealthConditions.length
    ? `User has these health conditions: ${userHealthConditions.join(", ")}. `
    : "";
  const dietaryText = Object.entries(dietaryPreferences)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ");
  const prompt = `Create a healthy recipe using these ingredients: ${ingredients.join(", ")}.
${healthConditionsText}${dietaryText ? `Dietary preferences: ${dietaryText}. ` : ""}

Respond with ONLY valid JSON:
{
  "recipeName": "Name of the recipe",
  "cookingTime": "X minutes",
  "difficulty": "Easy/Medium/Hard",
  "servings": "Number of servings",
  "calories": "Calories per serving",
  "healthScore": "1-10 rating",
  "ingredients": [{ "item": "ingredient name", "amount": "quantity", "notes": "preparation notes" }],
  "instructions": ["Step 1", "Step 2"],
  "nutritionFacts": { "protein": "grams", "carbs": "grams", "fat": "grams", "fiber": "grams", "sugar": "grams", "sodium": "mg" },
  "healthBenefits": ["benefits"],
  "suitableFor": ["conditions this recipe helps"],
  "modifications": { "diabetes": "…", "hypertension": "…", "pcos": "…" },
  "tips": ["cooking tips and alternatives"]
}
The recipe should suit the user's health conditions, use the provided ingredients as main components, and use healthy cooking methods.`;

  try {
    const text = await converse({
      chain: TEXT_CHAIN,
      messages: textMessage(prompt),
      maxTokens: 2000,
      temperature: 0.4,
    });
    return extractJson(text, "object");
  } catch (error) {
    console.error("Error generating recipe:", error.message);
    return {
      recipeName: "Simple Healthy Recipe",
      cookingTime: "30 minutes",
      difficulty: "Easy",
      servings: "2-3",
      calories: "200-300 per serving",
      healthScore: 7,
      ingredients: ingredients.map((ing) => ({ item: ing, amount: "As needed", notes: "Fresh preferred" })),
      instructions: ["Prepare all ingredients", "Cook according to your preference", "Season with healthy spices", "Serve immediately"],
      nutritionFacts: { protein: "15g", carbs: "20g", fat: "8g", fiber: "5g", sugar: "3g", sodium: "200mg" },
      healthBenefits: ["Provides essential nutrients"],
      suitableFor: ["General health"],
      modifications: { diabetes: "Reduce carbs, add more fiber", hypertension: "Reduce sodium, add potassium-rich foods", pcos: "Add anti-inflammatory spices" },
      tips: ["Recipe generation failed, showing basic template"],
    };
  }
};

// ---- generateRecipeFromIngredients (array of 3) ----------------------------
const generateRecipeFromIngredients = async (
  ingredients,
  healthConditions = [],
  dietType = "vegetarian"
) => {
  const healthConditionsText = healthConditions.length
    ? `User has these health conditions: ${healthConditions.join(", ")}. `
    : "";
  const prompt = `Generate 3 healthy recipes using these ingredients: ${ingredients}

User preferences:
- Diet type: ${dietType}
- ${healthConditionsText}

Return ONLY a valid JSON array (no other text) of 3 recipes, each:
{
  "recipeName": "…", "cookingTime": "30 minutes", "difficulty": "Easy", "servings": "2-3",
  "calories": "300 per serving", "healthScore": 8,
  "ingredients": [{ "item": "…", "amount": "1 cup", "notes": "…" }],
  "instructions": ["…"],
  "nutritionFacts": { "protein": "25g", "carbs": "15g", "fat": "12g", "fiber": "6g", "sugar": "4g", "sodium": "180mg" },
  "healthBenefits": ["…"], "suitableFor": ["…"],
  "modifications": { "diabetes": "…", "hypertension": "…" },
  "tips": ["…"]
}
Return ONLY the JSON array.`;

  try {
    const text = await converse({
      chain: TEXT_CHAIN,
      messages: textMessage(prompt),
      maxTokens: 2500,
      temperature: 0.5,
    });
    const recipes = extractJson(text, "array");
    console.log(`✅ Parsed ${recipes.length} recipes from Bedrock`);
    return recipes;
  } catch (error) {
    console.error("Error generating recipes:", error.message);
    return [
      {
        recipeName: "Simple Healthy Recipe",
        cookingTime: "30 minutes",
        difficulty: "Easy",
        servings: "2-3",
        calories: "200-300 per serving",
        healthScore: 7,
        ingredients: [{ item: ingredients, amount: "As needed", notes: "Fresh preferred" }],
        instructions: ["Prepare all ingredients", "Cook according to your preference", "Season with healthy spices", "Serve immediately"],
        nutritionFacts: { protein: "15g", carbs: "20g", fat: "8g", fiber: "5g", sugar: "3g", sodium: "200mg" },
        healthBenefits: ["Provides essential nutrients"],
        suitableFor: ["General health"],
        modifications: { diabetes: "Reduce carbs, add more fiber", hypertension: "Reduce sodium, add potassium-rich foods", pcos: "Add anti-inflammatory spices" },
        tips: ["Recipe generation failed, showing basic template"],
      },
    ];
  }
};

// ---- analyzeFoodByName -----------------------------------------------------
const analyzeFoodByName = async (foodName, userHealthConditions = []) => {
  const healthConditionsText = userHealthConditions.length
    ? `User has these health conditions: ${userHealthConditions.join(", ")}. `
    : "";
  const prompt = `Provide a comprehensive nutritional analysis for "${foodName}". ${healthConditionsText}

Respond with ONLY valid JSON:
{
  "foodName": "${foodName}",
  "calories": "Calories per 100g or standard serving",
  "nutritionFacts": { "protein": "grams", "carbs": "grams", "fat": "grams", "fiber": "grams", "sugar": "grams", "sodium": "mg" },
  "servingSize": "Standard serving size",
  "healthScore": "1-10 rating",
  "isHealthy": true,
  "recommendation": "Recommendation based on health conditions",
  "healthWarnings": ["warnings for user's health conditions"],
  "healthBenefits": ["health benefits"],
  "suitableFor": ["conditions this food is good for"],
  "avoidIf": ["conditions that should avoid this food"],
  "alternatives": ["healthier alternatives"],
  "bestTimeToEat": "when to consume this food",
  "portionControl": "recommended portion sizes"
}
${HEALTH_GUIDE}`;

  try {
    const text = await converse({
      chain: TEXT_CHAIN,
      messages: textMessage(prompt),
      maxTokens: 900,
      temperature: 0.5,
    });
    return extractJson(text, "object");
  } catch (error) {
    console.error("Error analyzing food by name:", error.message);
    return {
      foodName,
      calories: "Unable to analyze",
      nutritionFacts: { protein: "0g", carbs: "0g", fat: "0g", fiber: "0g", sugar: "0g", sodium: "0mg" },
      servingSize: "1 serving",
      healthScore: 5,
      isHealthy: true,
      recommendation: "Unable to analyze food. Please try again.",
      healthWarnings: ["Analysis failed"],
      healthBenefits: [],
      suitableFor: [],
      avoidIf: [],
      alternatives: [],
      bestTimeToEat: "Anytime",
      portionControl: "Moderate portions",
    };
  }
};

// ---- chatWithNutritionist --------------------------------------------------
const chatWithNutritionist = async (message, context = {}, healthConditions = []) => {
  const healthConditionsText = healthConditions.length
    ? `User has these health conditions: ${healthConditions.join(", ")}. `
    : "";
  const contextText = Object.keys(context).length
    ? `Context: ${JSON.stringify(context)}. `
    : "";
  const system = `You are a professional nutritionist and health advisor. Provide helpful, accurate, evidence-based, and personalized responses. Keep it conversational but professional. If a question requires medical attention, advise consulting a healthcare professional.`;
  const prompt = `${healthConditionsText}${contextText}User message: "${message}"`;

  try {
    return await converse({
      chain: TEXT_CHAIN,
      system,
      messages: textMessage(prompt),
      maxTokens: 600,
      temperature: 0.8,
    });
  } catch (error) {
    console.error("Error in chat with nutritionist:", error.message);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later or consult with a healthcare professional for personalized advice.";
  }
};

// ---- generateMealPlan ------------------------------------------------------
const generateMealPlan = async (options) => {
  const { days, calorieGoal, healthConditions = [], dietaryPreferences = {}, allergies = [] } = options;
  const healthConditionsText = healthConditions.length ? `Health conditions: ${healthConditions.join(", ")}. ` : "";
  const allergiesText = allergies.length ? `Allergies: ${allergies.join(", ")}. ` : "";
  const dietaryText = Object.entries(dietaryPreferences).filter(([, v]) => v).map(([k]) => k).join(", ");
  const prompt = `Create a ${days}-day meal plan:
- ${calorieGoal ? `Daily calorie target: ${calorieGoal} calories` : "Balanced calorie distribution"}
- ${healthConditionsText}${allergiesText}${dietaryText ? `Dietary preferences: ${dietaryText}` : ""}

Respond with ONLY valid JSON:
{
  "mealPlan": [
    { "day": 1, "date": "YYYY-MM-DD",
      "meals": {
        "breakfast": { "name": "…", "calories": 300, "ingredients": ["…"], "instructions": "…", "nutritionFacts": { "protein": "15g", "carbs": "30g", "fat": "10g" } },
        "lunch": {}, "dinner": {},
        "snacks": [{ "name": "…", "calories": 100, "ingredients": ["…"] }]
      },
      "dailyTotals": { "calories": 1800, "protein": "120g", "carbs": "200g", "fat": "60g" }
    }
  ],
  "summary": { "totalDays": ${days}, "avgDailyCalories": 1800, "healthFocus": ["…"], "shoppingList": ["…"], "tips": ["…"] }
}
Keep the plan nutritionally balanced, appropriate for the health conditions, practical, and varied. Daily total calories should be within 10 of the target.`;

  try {
    const text = await converse({
      chain: TEXT_CHAIN,
      messages: textMessage(prompt),
      maxTokens: 3000,
      temperature: 0.5,
    });
    return extractJson(text, "object");
  } catch (error) {
    console.error("Error generating meal plan:", error.message);
    return {
      mealPlan: [],
      summary: {
        totalDays: days,
        avgDailyCalories: calorieGoal || 1800,
        healthFocus: ["General health"],
        shoppingList: ["Unable to generate shopping list"],
        tips: ["Meal plan generation failed. Please try again."],
      },
    };
  }
};

// ---- getNutritionAdvice ----------------------------------------------------
const getNutritionAdvice = async (query, userProfile = {}, healthConditions = []) => {
  const healthConditionsText = healthConditions.length ? `Health conditions: ${healthConditions.join(", ")}. ` : "";
  const profileText = Object.keys(userProfile).length ? `User profile: ${JSON.stringify(userProfile)}. ` : "";
  const prompt = `As a professional nutritionist, provide advice for this query: "${query}"
${healthConditionsText}${profileText}

Respond with ONLY valid JSON:
{
  "advice": "Main advice and recommendations",
  "keyPoints": ["important points"],
  "dosList": ["things to do"],
  "dontsList": ["things to avoid"],
  "foodRecommendations": ["specific foods to include"],
  "foodsToAvoid": ["foods to limit or avoid"],
  "lifestyle": ["lifestyle recommendations"],
  "timeline": "expected timeline for results",
  "warnings": ["warnings or when to see a doctor"],
  "resources": ["additional resources"]
}`;

  try {
    const text = await converse({
      chain: TEXT_CHAIN,
      messages: textMessage(prompt),
      maxTokens: 900,
      temperature: 0.6,
    });
    return extractJson(text, "object");
  } catch (error) {
    console.error("Error getting nutrition advice:", error.message);
    return {
      advice: "I'm unable to provide specific advice at the moment. Please consult with a healthcare professional.",
      keyPoints: ["Consult with a healthcare professional"],
      dosList: ["Maintain a balanced diet", "Stay hydrated", "Exercise regularly"],
      dontsList: ["Don't make drastic dietary changes without professional guidance"],
      foodRecommendations: ["Fruits", "Vegetables", "Whole grains", "Lean proteins"],
      foodsToAvoid: ["Processed foods", "Excessive sugar", "Trans fats"],
      lifestyle: ["Regular exercise", "Adequate sleep", "Stress management"],
      timeline: "Results vary by individual",
      warnings: ["Consult healthcare provider for personalized advice"],
      resources: ["Registered dietitian", "Healthcare provider"],
    };
  }
};

// ---- generateContent (plain text) ------------------------------------------
const generateContent = async (prompt) => {
  try {
    return await converse({
      chain: TEXT_CHAIN,
      messages: textMessage(prompt),
      maxTokens: 800,
      temperature: 0.7,
    });
  } catch (error) {
    console.error("Error generating content:", error.message);
    return "Sorry, I encountered an error while generating content. Please try again later.";
  }
};

// ---- generateStructuredContent ---------------------------------------------
const generateStructuredContent = async (prompt, params = {}) => {
  const structuredPrompt = `Topic: ${params.topic || "Health"}
Format: ${params.format || "Bullet points"}
Length: ${params.length || "Short"}
Tone: ${params.tone || "Informative"}

${prompt || params.prompt || "Provide information on this topic."}`;
  try {
    return await converse({
      chain: TEXT_CHAIN,
      messages: textMessage(structuredPrompt),
      maxTokens: 800,
      temperature: 0.7,
    });
  } catch (error) {
    console.error("Error generating structured content:", error.message);
    return "Sorry, I encountered an error while generating structured content. Please try again later.";
  }
};

// ---- generateDailyDietPlan (single-day plan from profile/history) ----------
const generateDailyDietPlan = async (userProfile = {}, mealHistory = [], preferences = {}) => {
  const calorieGoal = userProfile.calorieGoal || preferences.calorieGoal || null;
  const healthConditions = userProfile.healthConditions || preferences.healthConditions || [];
  const dietType = preferences.dietType || userProfile.dietType || "balanced";
  const healthConditionsText = (healthConditions || []).length
    ? `Health conditions: ${healthConditions.join(", ")}. `
    : "";
  const historyText = (mealHistory || []).length
    ? `Avoid repeating these recent meals: ${JSON.stringify(mealHistory).slice(0, 800)}. `
    : "";
  const prompt = `Create a personalized ONE-day diet plan.
- ${calorieGoal ? `Daily calorie target: ${calorieGoal} calories` : "Balanced calories"}
- Diet type: ${dietType}. ${healthConditionsText}${historyText}

Respond with ONLY valid JSON:
{
  "date": "YYYY-MM-DD",
  "totalCalories": 1800,
  "meals": {
    "breakfast": { "name": "…", "calories": 400, "ingredients": ["…"], "instructions": "…", "nutritionFacts": { "protein": "20g", "carbs": "40g", "fat": "12g" } },
    "lunch": { "name": "…", "calories": 500, "ingredients": ["…"], "instructions": "…", "nutritionFacts": {} },
    "dinner": { "name": "…", "calories": 500, "ingredients": ["…"], "instructions": "…", "nutritionFacts": {} },
    "snacks": [{ "name": "…", "calories": 150, "ingredients": ["…"] }]
  },
  "dailyTotals": { "calories": 1800, "protein": "120g", "carbs": "200g", "fat": "60g" },
  "healthFocus": ["…"],
  "tips": ["…"]
}
Keep it varied, balanced, and appropriate for the health conditions.`;

  try {
    const text = await converse({
      chain: TEXT_CHAIN,
      messages: textMessage(prompt),
      maxTokens: 2000,
      temperature: 0.6,
    });
    return extractJson(text, "object");
  } catch (error) {
    console.error("Error generating daily diet plan:", error.message);
    return {
      date: new Date().toISOString().slice(0, 10),
      totalCalories: calorieGoal || 1800,
      meals: {
        breakfast: { name: "Oats with fruit & nuts", calories: 400, ingredients: ["oats", "banana", "almonds"], instructions: "Combine and serve.", nutritionFacts: {} },
        lunch: { name: "Grain bowl with vegetables", calories: 500, ingredients: ["quinoa", "chickpeas", "spinach"], instructions: "Combine and serve.", nutritionFacts: {} },
        dinner: { name: "Dal with brown rice", calories: 500, ingredients: ["lentils", "brown rice", "vegetables"], instructions: "Cook and serve.", nutritionFacts: {} },
        snacks: [{ name: "Fruit & nuts", calories: 150, ingredients: ["apple", "walnuts"] }],
      },
      dailyTotals: { calories: calorieGoal || 1800, protein: "120g", carbs: "200g", fat: "60g" },
      healthFocus: ["General health"],
      tips: ["Diet plan generation failed. Showing a basic balanced plan."],
    };
  }
};

module.exports = {
  analyzeFoodImage,
  generateHealthyRecipe,
  generateRecipeFromIngredients,
  analyzeFoodByName,
  chatWithNutritionist,
  generateMealPlan,
  getNutritionAdvice,
  generateContent,
  generateStructuredContent,
  generateDailyDietPlan,
  // exposed for reuse/testing
  converse,
  TEXT_CHAIN,
  IMAGE_CHAIN,
};
