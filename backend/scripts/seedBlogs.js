require('dotenv').config();
const { db, admin } = require('../src/config/firebase');

const sampleBlogs = [
  {
    title: "5 Healthy Habits for a Stronger Immune System",
    author: "Jane Doe",
    date: "2025-09-10",
    category: "Health",
    tags: ["immunity", "healthy living", "wellness"],
    cover_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
    excerpt: "Learn five simple daily habits that can naturally support your immune system.",
    content: "Taking care of your immune system doesn't have to be complicated. Here are five easy things you can do every day:\n\n1. **Eat Nutritious Foods**: Focus on whole foods rich in vitamins and minerals. Include plenty of fruits, vegetables, lean proteins, and whole grains in your diet.\n\n2. **Get Enough Sleep**: Aim for 7-9 hours of quality sleep each night. Sleep is when your body repairs and regenerates immune cells.\n\n3. **Stay Hydrated**: Drink at least 8 glasses of water daily. Proper hydration helps your body flush out toxins and maintain optimal function.\n\n4. **Exercise Regularly**: Moderate exercise boosts immune function. Aim for at least 30 minutes of physical activity most days of the week.\n\n5. **Manage Stress**: Chronic stress weakens your immune system. Practice relaxation techniques like meditation, deep breathing, or yoga.\n\nThese simple habits can make a significant difference in your overall health and well-being. Start with one habit and gradually incorporate the others into your daily routine.",
    related_posts: [],
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    views: 127,
  },
  {
    title: "The Ultimate Guide to Home Workouts",
    author: "Mike Johnson",
    date: "2025-09-08",
    category: "Fitness",
    tags: ["home workout", "exercise", "fitness", "strength training"],
    cover_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
    excerpt: "Transform your living space into a personal gym with these effective home workout routines.",
    content: "Working out at home has never been more popular or accessible. Here's your complete guide to creating an effective home fitness routine:\n\n**Getting Started**\nYou don't need expensive equipment to get a great workout at home. Your body weight provides plenty of resistance for building strength and endurance.\n\n**Essential Bodyweight Exercises:**\n- Push-ups (chest, shoulders, triceps)\n- Squats (legs, glutes)\n- Lunges (legs, balance)\n- Planks (core strength)\n- Burpees (full body cardio)\n\n**Creating Your Routine**\n1. Warm up for 5-10 minutes\n2. Perform 3-4 exercises for 3 sets each\n3. Rest 30-60 seconds between sets\n4. Cool down with stretching\n\n**Weekly Schedule**\n- Monday: Upper body focus\n- Tuesday: Cardio/HIIT\n- Wednesday: Lower body focus\n- Thursday: Core and flexibility\n- Friday: Full body circuit\n- Weekend: Active recovery (walking, yoga)\n\nConsistency is key. Start with 20-30 minute sessions and gradually increase duration and intensity as you build fitness.",
    related_posts: [],
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    views: 89,
  },
  {
    title: "Nutrition 101: Building a Balanced Meal Plan",
    author: "Dr. Sarah Wilson",
    date: "2025-09-06",
    category: "Nutrition",
    tags: ["nutrition", "meal planning", "healthy eating", "diet"],
    cover_image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
    excerpt: "Master the art of meal planning with this comprehensive guide to balanced nutrition.",
    content: "Creating a balanced meal plan doesn't have to be complicated. Follow these evidence-based principles for optimal nutrition:\n\n**The Balanced Plate Method**\n- 1/2 plate: Non-starchy vegetables (broccoli, spinach, peppers)\n- 1/4 plate: Lean protein (chicken, fish, tofu, legumes)\n- 1/4 plate: Complex carbohydrates (quinoa, brown rice, sweet potato)\n- Add healthy fats (avocado, nuts, olive oil)\n\n**Macronutrient Breakdown**\n- Carbohydrates: 45-65% of total calories\n- Protein: 10-35% of total calories\n- Fats: 20-35% of total calories\n\n**Meal Planning Tips**\n1. Plan your meals weekly\n2. Prep ingredients in advance\n3. Include variety to prevent boredom\n4. Listen to your hunger cues\n5. Stay hydrated throughout the day\n\n**Sample Day**\n- Breakfast: Oatmeal with berries and nuts\n- Lunch: Quinoa salad with grilled chicken\n- Snack: Greek yogurt with fruit\n- Dinner: Baked salmon with roasted vegetables\n\nRemember, the best diet is one you can maintain long-term. Focus on progress, not perfection.",
    related_posts: [],
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    views: 156,
  },
  {
    title: "Mental Health and Wellness: A Holistic Approach",
    author: "Dr. Emily Chen",
    date: "2025-09-04",
    category: "Mental Health",
    tags: ["mental health", "wellness", "mindfulness", "stress management"],
    cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    excerpt: "Discover practical strategies for maintaining mental wellness in today's fast-paced world.",
    content: "Mental health is just as important as physical health. Here's how to nurture your mental wellness:\n\n**Understanding Mental Wellness**\nMental wellness involves emotional, psychological, and social well-being. It affects how we think, feel, and act in daily life.\n\n**Key Strategies for Mental Health**\n\n1. **Practice Mindfulness**\n   - Daily meditation (even 5 minutes helps)\n   - Deep breathing exercises\n   - Present-moment awareness\n\n2. **Build Strong Relationships**\n   - Maintain social connections\n   - Communicate openly with loved ones\n   - Seek support when needed\n\n3. **Establish Healthy Boundaries**\n   - Learn to say no\n   - Limit social media exposure\n   - Create work-life balance\n\n4. **Engage in Meaningful Activities**\n   - Pursue hobbies you enjoy\n   - Volunteer for causes you care about\n   - Set achievable goals\n\n**Warning Signs to Watch For**\n- Persistent sadness or anxiety\n- Changes in sleep or appetite\n- Difficulty concentrating\n- Loss of interest in activities\n\nRemember, seeking professional help is a sign of strength, not weakness. Mental health professionals can provide valuable tools and support.",
    related_posts: [],
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    views: 203,
  },
  {
    title: "Hydration: The Foundation of Good Health",
    author: "Lisa Martinez",
    date: "2025-09-02",
    category: "Health",
    tags: ["hydration", "water", "health", "wellness"],
    cover_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop",
    excerpt: "Understanding the critical role of proper hydration in maintaining optimal health and performance.",
    content: "Water is essential for life, yet many people don't drink enough. Here's everything you need to know about proper hydration:\n\n**Why Hydration Matters**\n- Regulates body temperature\n- Transports nutrients to cells\n- Removes waste products\n- Lubricates joints\n- Maintains blood pressure\n\n**How Much Water Do You Need?**\nThe general recommendation is 8 glasses (64 ounces) per day, but individual needs vary based on:\n- Activity level\n- Climate\n- Overall health\n- Pregnancy or breastfeeding\n\n**Signs of Proper Hydration**\n- Light yellow urine\n- Moist lips and mouth\n- Elastic skin\n- Stable energy levels\n\n**Hydration Tips**\n1. Start your day with a glass of water\n2. Keep a water bottle with you\n3. Eat water-rich foods (cucumbers, watermelon)\n4. Set reminders to drink water\n5. Monitor your urine color\n\n**Beyond Plain Water**\n- Herbal teas count toward fluid intake\n- Fruits and vegetables provide hydration\n- Limit caffeine and alcohol (they can be dehydrating)\n\n**Special Considerations**\nIncrease water intake during:\n- Exercise\n- Hot weather\n- Illness (fever, vomiting, diarrhea)\n- Air travel\n\nProper hydration is one of the simplest yet most effective ways to support your health.",
    related_posts: [],
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    views: 94,
  },
  {
    title: "Sleep Optimization: Your Guide to Better Rest",
    author: "Dr. Robert Kim",
    date: "2025-08-31",
    category: "Health",
    tags: ["sleep", "rest", "recovery", "health"],
    cover_image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=400&fit=crop",
    excerpt: "Unlock the secrets to quality sleep and wake up refreshed every morning.",
    content: "Quality sleep is crucial for physical health, mental well-being, and overall performance. Here's how to optimize your sleep:\n\n**Understanding Sleep Cycles**\nSleep occurs in cycles of about 90 minutes, including:\n- Light sleep (stages 1-2)\n- Deep sleep (stage 3)\n- REM sleep (dreaming stage)\n\n**Sleep Hygiene Basics**\n\n1. **Consistent Schedule**\n   - Go to bed and wake up at the same time daily\n   - Maintain schedule even on weekends\n\n2. **Create a Sleep Environment**\n   - Keep bedroom cool (65-68°F)\n   - Use blackout curtains or eye mask\n   - Minimize noise or use white noise\n   - Invest in a comfortable mattress and pillows\n\n3. **Pre-Sleep Routine**\n   - Wind down 1 hour before bed\n   - Avoid screens (blue light disrupts melatonin)\n   - Try reading, gentle stretching, or meditation\n   - Take a warm bath or shower\n\n**What to Avoid**\n- Caffeine after 2 PM\n- Large meals close to bedtime\n- Alcohol (disrupts sleep quality)\n- Intense exercise within 3 hours of sleep\n\n**Natural Sleep Aids**\n- Chamomile tea\n- Magnesium supplements\n- Lavender aromatherapy\n- Progressive muscle relaxation\n\n**When to Seek Help**\nConsult a healthcare provider if you experience:\n- Chronic insomnia\n- Loud snoring\n- Daytime fatigue despite adequate sleep\n- Difficulty staying asleep\n\nRemember, good sleep is not a luxury—it's a necessity for optimal health and well-being.",
    related_posts: [],
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    views: 178,
  },
];

async function seedBlogs() {
  try {
    console.log('🌱 Starting to seed blogs...');
    
    // Check if blogs already exist
    const existingBlogs = await db.collection('blogs').get();
    if (!existingBlogs.empty) {
      console.log('📚 Blogs already exist in database. Skipping seed.');
      return;
    }

    // Add each blog to Firestore
    const batch = db.batch();
    
    sampleBlogs.forEach((blog) => {
      const blogRef = db.collection('blogs').doc();
      batch.set(blogRef, blog);
    });

    await batch.commit();
    
    console.log(`✅ Successfully seeded ${sampleBlogs.length} blogs to Firestore!`);
    
    // Verify the blogs were added
    const verifySnapshot = await db.collection('blogs').get();
    console.log(`📊 Total blogs in database: ${verifySnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedBlogs();