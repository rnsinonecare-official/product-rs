import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { generateChatbotResponse } from '../../services/geminiService';
import toast from 'react-hot-toast';
import rainscareLogo from '../../images/RAINSCARE WOB.png';

const Chatbot = () => {
  const { userProfile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [inputError, setInputError] = useState('');
  const messagesEndRef = useRef(null);

  // Input validation constants
  const MAX_MESSAGE_LENGTH = 500;
  const WARNING_THRESHOLD = 450;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Input validation and handling
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Clear previous error
    setInputError('');
    
    // Check length limit
    if (value.length > MAX_MESSAGE_LENGTH) {
      setInputError(`Message too long! Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
      return; // Don't update input if over limit
    }
    
    // Show warning when approaching limit
    if (value.length > WARNING_THRESHOLD) {
      setInputError(`Approaching character limit: ${value.length}/${MAX_MESSAGE_LENGTH}`);
    }
    
    setInputMessage(value);
  };

  const validateAndProcessMessage = () => {
    const trimmedMessage = inputMessage.trim();
    
    // Check if message is empty
    if (!trimmedMessage) {
      setInputError('Please enter a message');
      return;
    }
    
    // Check length
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setInputError(`Message too long! Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
      return;
    }
    
    // Check for minimum meaningful length
    if (trimmedMessage.length < 2) {
      setInputError('Please enter a more detailed message');
      return;
    }
    
    // Clear error and process message
    setInputError('');
    processUserMessage(trimmedMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      validateAndProcessMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setTimeout(() => {
        addBotMessage(getPersonalizedGreeting());
        setShowQuickReplies(true);
      }, 500);
    }
  }, [isOpen]);

  const getPersonalizedGreeting = () => {
    const name = userProfile?.name || 'there';
    const conditions = userProfile?.healthConditions || [];
    
    if (conditions.includes('pcos')) {
      return `Hi ${name}! 👋 I'm your AI-powered nutrition assistant. I see you're managing PCOS - I can provide personalized advice, suggest PCOS-friendly foods, and help you track your nutrients. Ask me anything about your health and nutrition!`;
    } else if (conditions.includes('diabetes')) {
      return `Hello ${name}! 🌟 I'm your AI health assistant, specialized in diabetes management. I can provide personalized nutrition advice, suggest blood sugar-friendly foods, and help you make informed dietary choices. What would you like to know?`;
    } else {
      return `Hey ${name}! 🤖 I'm your AI-powered nutrition assistant. I can provide personalized health advice, analyze your dietary needs, suggest healthy alternatives, and answer any nutrition questions you have. How can I help you today?`;
    }
  };

  const addBotMessage = (message, type = 'text') => {
    const botMessage = {
      id: Date.now(),
      text: message,
      sender: 'bot',
      type: type,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const addUserMessage = (message) => {
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const quickReplies = [
    { text: "Analyze my nutrition", action: "nutrition_check" },
    { text: "What nutrients am I missing?", action: "deficiency_check" },
    { text: "Suggest healthy meals", action: "meal_suggestions" },
    { text: "Help with my health condition", action: "health_condition_help" },
    { text: "Create a meal plan", action: "meal_planning" },
    { text: "Food recommendations", action: "food_recommendations" }
  ];

  const handleQuickReply = async (reply) => {
    addUserMessage(reply.text);
    setShowQuickReplies(false);
    setIsTyping(true);
    
    // Brief delay to show typing indicator
    setTimeout(async () => {
      setIsTyping(false);
      await processBotResponse(reply.action);
    }, 800);
  };

  const processUserMessage = async (message) => {
    addUserMessage(message);
    setInputMessage('');
    setIsTyping(true);
    
    // Brief delay to show typing indicator
    setTimeout(async () => {
      setIsTyping(false);
      await processBotResponse(message.toLowerCase());
    }, 800);
  };

  const processBotResponse = async (input) => {
    try {
      console.log('🤖 Processing bot response for:', input);
      console.log('👤 User profile:', userProfile);
      
      // Create conversation history for context
      const conversationHistory = messages.slice(-5).map(msg => ({
        type: msg.type === 'user' ? 'User' : 'Assistant',
        content: msg.content
      }));
      
      // Show loading state
      toast.loading('AI is thinking...', { id: 'chatbot-thinking' });
      
      // Get AI response from Gemini
      const aiResponse = await generateChatbotResponse(input, userProfile, conversationHistory);
      
      // Dismiss loading toast
      toast.dismiss('chatbot-thinking');
      
      console.log('✅ AI response received:', aiResponse);
      
      // Add AI response to chat
      addBotMessage(aiResponse, 'ai_response');
      setShowQuickReplies(true);
      
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      toast.dismiss('chatbot-thinking');
      toast.error('Sorry, I had trouble processing your request');
      
      // Fallback to basic response
      let fallbackResponse = "I apologize, but I'm having trouble connecting to my AI service right now. ";
      
      if (input.includes('nutrition') || input.includes('food')) {
        fallbackResponse += "For nutrition questions, I'd recommend consulting with a registered dietitian or using the food analysis feature in the app.";
      } else if (input.includes('exercise') || input.includes('workout')) {
        fallbackResponse += "For exercise guidance, consider speaking with a fitness professional or checking out the progress tracking feature.";
      } else if (input.includes('health') || input.includes('symptoms')) {
        fallbackResponse += "For health concerns, please consult with a healthcare professional.";
      } else {
        fallbackResponse += "Please try again in a moment, or explore the other features in the app.";
      }
      
      addBotMessage(fallbackResponse, 'fallback');
      setShowQuickReplies(true);
    }
  };

  const getNutritionAnalysis = () => {
    const mockData = {
      calories: { consumed: 1450, target: 1800, status: 'low' },
      protein: { consumed: 45, target: 60, status: 'low' },
      carbs: { consumed: 180, target: 200, status: 'good' },
      fats: { consumed: 50, target: 65, status: 'good' },
      fiber: { consumed: 18, target: 25, status: 'low' },
      water: { consumed: 6, target: 8, status: 'low' }
    };

    return `📊 Here's your nutrition today:\n\n• Calories: ${mockData.calories.consumed}/${mockData.calories.target} (${mockData.calories.status})\n• Protein: ${mockData.protein.consumed}g/${mockData.protein.target}g (${mockData.protein.status})\n• Carbs: ${mockData.carbs.consumed}g/${mockData.carbs.target}g (${mockData.carbs.status})\n• Fats: ${mockData.fats.consumed}g/${mockData.fats.target}g (${mockData.fats.status})\n• Fiber: ${mockData.fiber.consumed}g/${mockData.fiber.target}g (${mockData.fiber.status})\n• Water: ${mockData.water.consumed}/${mockData.water.target} glasses (${mockData.water.status})\n\n💡 You're doing well with carbs and fats! Consider adding more protein and fiber to your meals.`;
  };

  const getDeficiencyAnalysis = () => {
    const conditions = userProfile?.healthConditions || [];
    
    if (conditions.includes('pcos')) {
      return `🔍 Based on your PCOS profile and today's intake:\n\n⚠️ **You may be low on:**\n• Protein (need 15g more)\n• Omega-3 fatty acids\n• Magnesium\n• Vitamin D\n• Fiber (need 7g more)\n\n💡 **Recommendations:**\n• Add Greek yogurt or nuts for protein\n• Include fatty fish or walnuts\n• Have a glass of milk or supplement Vitamin D\n• Add more vegetables and whole grains`;
    } else if (conditions.includes('diabetes')) {
      return `🔍 For diabetes management, you're missing:\n\n⚠️ **Key nutrients you need:**\n• Chromium (helps insulin function)\n• Fiber (need 10g more)\n• Healthy fats\n• Magnesium\n\n💡 **Suggestions:**\n• Add cinnamon to your meals\n• Include more leafy greens\n• Try nuts or seeds as snacks\n• Consider berries for antioxidants`;
    } else {
      return `🔍 Based on your general health profile:\n\n⚠️ **You might be low on:**\n• Protein (15g below target)\n• Vitamin C\n• Iron\n• Fiber (7g below target)\n\n💡 **Easy fixes:**\n• Add lean meat, eggs, or legumes\n• Include citrus fruits or bell peppers\n• Try spinach or fortified cereals\n• Add more whole grains and vegetables`;
    }
  };

  const getSnackSuggestions = () => {
    const conditions = userProfile?.healthConditions || [];
    
    if (conditions.includes('pcos')) {
      return `🍎 PCOS-friendly snacks for you:\n\n✅ **High-protein options:**\n• Greek yogurt with berries\n• Almonds or walnuts (handful)\n• Hard-boiled eggs\n• Cottage cheese with cucumber\n\n✅ **Anti-inflammatory choices:**\n• Green tea with a small apple\n• Carrot sticks with hummus\n• Chia seed pudding\n• Dark chocolate (70%+ cacao)\n\nThese help stabilize blood sugar and reduce inflammation! 🌿`;
    } else {
      return `🥜 Healthy snack ideas for you:\n\n✅ **Protein-rich:**\n• Greek yogurt with nuts\n• Hummus with vegetables\n• Apple slices with almond butter\n• Trail mix (nuts + dried fruit)\n\n✅ **Energy boosting:**\n• Banana with peanut butter\n• Whole grain crackers with cheese\n• Smoothie with protein powder\n• Oatmeal with berries\n\nPerfect for keeping you satisfied between meals! 🌟`;
    }
  };

  const getMealPlanSuggestions = () => {
    return `🍽️ Here's a personalized meal plan for tomorrow:\n\n**Breakfast (7-8 AM):**\n• Oatmeal with berries and Greek yogurt\n• Green tea\n\n**Mid-Morning (10 AM):**\n• Apple with almond butter\n\n**Lunch (12-1 PM):**\n• Quinoa bowl with grilled chicken\n• Mixed vegetables\n• Olive oil dressing\n\n**Afternoon (3-4 PM):**\n• Hummus with carrot sticks\n\n**Dinner (6-7 PM):**\n• Grilled salmon with sweet potato\n• Steamed broccoli\n\n**Evening (8-9 PM):**\n• Chamomile tea\n\nThis plan provides balanced nutrition for your goals! 🎯`;
  };

  const getWaterTrackingInfo = () => {
    return `💧 Water intake tracking:\n\n**Today's progress:** 6/8 glasses\n**You need:** 2 more glasses\n\n💡 **Hydration tips:**\n• Drink a glass when you wake up\n• Have water before each meal\n• Set hourly reminders\n• Add lemon or cucumber for flavor\n\n**Benefits you'll notice:**\n• Better energy levels\n• Improved skin health\n• Better digestion\n• Reduced hunger cravings\n\nKeep going! You're almost at your goal! 🌊`;
  };

  const getPCOSFoodSuggestions = () => {
    return `🌸 PCOS-friendly foods to include:\n\n✅ **Anti-inflammatory:**\n• Fatty fish (salmon, sardines)\n• Leafy greens (spinach, kale)\n• Berries (blueberries, strawberries)\n• Turmeric and ginger\n\n✅ **Blood sugar stabilizers:**\n• Cinnamon\n• Whole grains (quinoa, brown rice)\n• Legumes (lentils, chickpeas)\n• Nuts and seeds\n\n✅ **Hormone balancing:**\n• Spearmint tea\n• Flaxseeds\n• Avocados\n• Dark chocolate (70%+)\n\n❌ **Limit:** Processed foods, sugary drinks, white bread\n\nThese foods can help manage PCOS symptoms naturally! 💪`;
  };

  const getRecipeSuggestions = () => {
    return `👨‍🍳 Quick healthy recipes for you:\n\n**🥗 Protein Power Bowl (15 min):**\n• Quinoa + grilled chicken\n• Avocado + cherry tomatoes\n• Olive oil + lemon dressing\n\n**🍳 Veggie Scramble (10 min):**\n• 2 eggs + spinach + bell peppers\n• Sprinkle of cheese\n• Whole grain toast\n\n**🥤 Green Smoothie (5 min):**\n• Spinach + banana + Greek yogurt\n• Almond milk + chia seeds\n• Honey (optional)\n\nAll recipes are nutrient-dense and delicious! Want the full instructions for any of these? 🍽️`;
  };

  const getCalorieInfo = () => {
    return `🔢 Your calorie breakdown:\n\n**Daily Target:** 1,800 calories\n**Current Intake:** 1,450 calories\n**Remaining:** 350 calories\n\n**Calorie distribution:**\n• Breakfast: 400 cal (22%)\n• Lunch: 550 cal (31%)\n• Dinner: 500 cal (28%)\n• Snacks: 350 cal (19%)\n\n💡 **Tip:** You have room for a healthy snack! Try:\n• Greek yogurt with berries (150 cal)\n• Handful of nuts (200 cal)\n• Protein smoothie (250 cal)\n\nStay within your goals while feeling satisfied! 🎯`;
  };

  const getGeneralResponse = () => {
    const responses = [
      "I can help you with nutrition tracking, meal planning, and healthy recipes. What would you like to know?",
      "I'm here to support your health journey! Ask me about your daily nutrition, food suggestions, or meal planning.",
      "Let me help you make healthier choices! I can analyze your nutrition, suggest foods, or help with meal planning.",
      "I'm your nutrition buddy! Feel free to ask about calories, nutrients, recipes, or healthy eating tips."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const TypingIndicator = () => (
    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-2xl rounded-bl-none max-w-xs">
      <Bot className="w-5 h-5 text-sage" />
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  const QuickReplies = () => (
    <div className="mt-4 flex flex-wrap gap-2">
      {quickReplies.slice(0, 4).map((reply, index) => (
        <button
          key={index}
          onClick={() => handleQuickReply(reply)}
          className="bg-sage/10 text-sage px-3 py-2 rounded-full text-sm hover:bg-sage/20 transition-colors"
        >
          {reply.text}
        </button>
      ))}
    </div>
  );

  const MessageBubble = ({ message }) => {
    const isBot = message.sender === 'bot';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isBot 
            ? 'bg-gray-100 text-gray-800 rounded-bl-none' 
            : 'bg-sage text-white rounded-br-none'
        }`}>
          {isBot && (
            <div className="flex items-center space-x-2 mb-1">
              <Bot className="w-4 h-4 text-sage" />
              <span className="text-xs text-gray-500">AI Assistant</span>
            </div>
          )}
          <p className="text-sm whitespace-pre-line">{message.text}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-white text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 border-2 border-sage"
        whileHover={{ 
          scale: 1.15, 
          rotate: [0, -5, 5, 0],
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          y: isOpen ? 0 : [0, -10, 0],
          rotate: isOpen ? 0 : [0, 3, -3, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: isOpen ? 0 : Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          animate={{ 
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 0.9 : 1
          }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-sage" />
          ) : (
            <motion.img 
              src={rainscareLogo} 
              alt="Rainscare Chat" 
              className="w-8 h-8 object-contain"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
        {!isOpen && (
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-xs text-white">!</span>
          </motion.div>
        )}
        
        {/* Enhanced Pulse ring effects */}
        {!isOpen && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-sage"
              animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-light-green"
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-sage/10"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
          </>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-sage text-white p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Nutrition Assistant</h3>
                    <p className="text-xs opacity-90">Always here to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              {showQuickReplies && messages.length > 0 && <QuickReplies />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              {/* Character count and error display */}
              <div className="mb-2 flex justify-between items-center text-xs">
                <span className={`${
                  inputMessage.length > WARNING_THRESHOLD 
                    ? 'text-orange-500' 
                    : inputMessage.length > MAX_MESSAGE_LENGTH * 0.8 
                      ? 'text-yellow-500' 
                      : 'text-gray-500'
                }`}>
                  {inputMessage.length}/{MAX_MESSAGE_LENGTH} characters
                </span>
                {inputError && (
                  <span className="text-red-500 text-xs">{inputError}</span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your nutrition... (max 500 characters)"
                    rows={1}
                    maxLength={MAX_MESSAGE_LENGTH}
                    className={`w-full px-4 py-2 border rounded-2xl resize-none focus:outline-none focus:ring-2 transition-colors ${
                      inputError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-sage'
                    }`}
                    style={{
                      minHeight: '40px',
                      maxHeight: '120px',
                      overflowY: inputMessage.length > 100 ? 'auto' : 'hidden'
                    }}
                  />
                  
                  {/* Visual indicator for character limit */}
                  <div 
                    className="absolute bottom-1 right-12 h-1 bg-gray-200 rounded-full"
                    style={{ width: '60px' }}
                  >
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        inputMessage.length > MAX_MESSAGE_LENGTH * 0.9 
                          ? 'bg-red-500' 
                          : inputMessage.length > MAX_MESSAGE_LENGTH * 0.7 
                            ? 'bg-orange-500' 
                            : 'bg-sage'
                      }`}
                      style={{ 
                        width: `${Math.min((inputMessage.length / MAX_MESSAGE_LENGTH) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={validateAndProcessMessage}
                  disabled={!inputMessage.trim() || inputMessage.length > MAX_MESSAGE_LENGTH || isTyping}
                  className="bg-sage text-white p-2 rounded-full hover:bg-sage/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                  title={
                    !inputMessage.trim() 
                      ? 'Enter a message' 
                      : inputMessage.length > MAX_MESSAGE_LENGTH 
                        ? 'Message too long' 
                        : isTyping 
                          ? 'AI is responding...' 
                          : 'Send message'
                  }
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {/* Helpful tips */}
              <div className="mt-2 text-xs text-gray-500">
                💡 Tip: Be specific about your health goals for better AI recommendations
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;