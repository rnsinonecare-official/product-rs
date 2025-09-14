# AI-Powered Health & Nutrition App - Feature Guide

## 🚀 AI Features Overview

This app now uses **Google Gemini AI** for comprehensive food analysis and recipe generation. All features are powered by AI instead of manual data entry.

### 🔑 API Key Configuration
- **Current API Key**: `AIzaSyDmw0aI0jfEpyACqQndfMM4BkSZh0phAtY`
- **Location**: `.env` file in the project root
- **Environment Variable**: `REACT_APP_GEMINI_API_KEY`

---

## 🍎 Food Analysis Features

### 1. **AI-Powered Food Search**
- **How it works**: Type any food name and click "Search"
- **AI Analysis**: Gemini analyzes nutrition facts, health benefits, and warnings
- **Personalized**: Based on your health conditions (diabetes, hypertension, PCOS, etc.)
- **Example**: Search for "banana" or "chicken breast"

### 2. **AI Food Analysis Button**
- **Location**: Food Analysis page
- **Function**: Type a food name and click "AI Analyze"
- **Result**: Detailed nutritional breakdown with health recommendations
- **Personalization**: Tailored to your specific health conditions

### 3. **Image Analysis**
- **Function**: Upload or take a photo of food
- **AI Processing**: Gemini identifies food and provides nutritional analysis
- **Health Scoring**: Rates food from 1-10 based on your health profile

---

## 🍳 Recipe Generation Features

### 1. **Ingredient-Based Recipe Generation**
- **How to use**:
  1. Add ingredients (search or type custom ingredients)
  2. Click "Find Recipes" for AI-generated recipes
  3. Click "AI Recipe" for a single personalized recipe
- **AI Processing**: Creates 3 different recipe options using your ingredients
- **Health Optimization**: Considers your dietary restrictions and health conditions

### 2. **Health-Focused Recipe Recommendations**
- **Function**: Click "Health Recipes" button
- **AI Analysis**: Generates recipes specifically for your health conditions
- **Features**:
  - Personalized recipe suggestions
  - Health benefit explanations
  - Ingredient recommendations
  - Foods to avoid lists

### 3. **Custom Ingredient Input**
- **Feature**: Type any ingredient name
- **Function**: Press Enter or click + to add
- **Flexibility**: No limitation to predefined ingredient lists

---

## 🎯 Health Personalization

### Supported Health Conditions:
- **Diabetes**: Low glycemic index, controlled carbs
- **Hypertension**: Low sodium, heart-healthy options
- **PCOS/PCOD**: Anti-inflammatory, hormone-balancing foods
- **Thyroid**: Iodine considerations, avoiding goitrogenic foods
- **Weight Management**: Calorie-controlled, high-satiety options

### Dietary Preferences:
- Vegetarian/Vegan options
- Gluten-free alternatives
- Dairy-free options
- Custom dietary restrictions

---

## 📱 How to Use

### Food Analysis:
1. Go to "Food Analysis" page
2. Type food name (e.g., "apple", "grilled chicken")
3. Click "AI Analyze" button
4. View personalized nutritional analysis
5. Add to daily log if desired

### Recipe Generation:
1. Go to "Recipe Generator" page
2. Add ingredients by searching or typing
3. Choose generation method:
   - **"Find Recipes"**: Multiple AI-generated options
   - **"AI Recipe"**: Single personalized recipe
   - **"Health Recipes"**: Health-focused recommendations
4. View detailed recipes with instructions

### Health Recommendations:
1. Complete your health profile in onboarding
2. All AI features automatically consider your conditions
3. Get personalized warnings and recommendations
4. View alternative food suggestions

---

## 🔧 Technical Details

### AI Service Integration:
- **Provider**: Google Gemini AI (gemini-1.5-flash model)
- **Features**: Text analysis, image recognition, recipe generation
- **Error Handling**: Comprehensive error messages and fallback options
- **Performance**: Real-time analysis with loading indicators

### Data Processing:
- **No Manual Data**: All information is AI-generated
- **Real-time Analysis**: Fresh analysis for every request
- **Personalization**: Based on user health profile
- **Accuracy**: Leverages Google's advanced AI models

### User Experience:
- **Loading States**: Clear feedback during AI processing
- **Error Messages**: Helpful error information
- **Toast Notifications**: Success and error alerts
- **Responsive Design**: Works on all device sizes

---

## 🚀 Getting Started

1. **Setup Complete**: API key is already configured
2. **Complete Profile**: Fill out your health information in onboarding
3. **Start Analyzing**: Begin with food analysis or recipe generation
4. **Explore Features**: Try different AI-powered tools

### Test the AI Features:
1. **Food Analysis**: Search for "oatmeal" and click "AI Analyze"
2. **Recipe Generation**: Add ingredients like "tomato, onion, rice" and click "AI Recipe"
3. **Health Recommendations**: Click "Health Recipes" for personalized suggestions

---

## 📊 Benefits

### For Users:
- **Personalized Nutrition**: AI considers your specific health needs
- **Recipe Discovery**: Unlimited recipe possibilities from available ingredients
- **Health Optimization**: Smart recommendations for better health outcomes
- **Time Saving**: Instant analysis without manual research

### For Health Goals:
- **Diabetes Management**: Carb-conscious recommendations
- **Heart Health**: Low-sodium, heart-healthy options
- **Weight Management**: Calorie-controlled suggestions
- **PCOS Support**: Anti-inflammatory food choices

---

## 🎉 Ready to Use!

The app is now fully AI-powered and ready for comprehensive food analysis and recipe generation. All features automatically adapt to your health profile for personalized recommendations.

**Start exploring your personalized nutrition journey!**