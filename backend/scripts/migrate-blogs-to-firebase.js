const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require("../config/firebase-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Sample blog data to migrate to Firebase
const sampleBlogs = [
  {
    title: "5 Healthy Habits for a Stronger Immune System",
    author: "Jane Doe",
    date: "2025-09-10",
    category: "Health",
    tags: ["immunity", "healthy living", "wellness"],
    cover_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
    excerpt: "Learn five simple daily habits that can naturally support your immune system.",
    content: `Taking care of your immune system doesn't have to be complicated. Here are five easy things you can do every day:

1. **Eat Nutritious Foods**: Focus on whole foods rich in vitamins and minerals. Include plenty of fruits, vegetables, lean proteins, and whole grains in your diet.

2. **Get Enough Sleep**: Aim for 7-9 hours of quality sleep each night. Sleep is when your body repairs and regenerates immune cells.

3. **Stay Hydrated**: Drink at least 8 glasses of water daily. Proper hydration helps your body flush out toxins and maintain optimal function.

4. **Exercise Regularly**: Moderate exercise boosts immune function. Aim for at least 30 minutes of physical activity most days of the week.

5. **Manage Stress**: Chronic stress weakens your immune system. Practice relaxation techniques like meditation, deep breathing, or yoga.

These simple habits can make a significant difference in your overall health and well-being. Start with one habit and gradually incorporate the others into your daily routine.`,
    related_posts: [],
    isActive: true,
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
    content: `Working out at home has never been more popular or accessible. Here's your complete guide to creating an effective home fitness routine:

**Getting Started**
You don't need expensive equipment to get a great workout at home. Your body weight provides plenty of resistance for building strength and endurance.

**Essential Bodyweight Exercises:**
- Push-ups (chest, shoulders, triceps)
- Squats (legs, glutes)
- Lunges (legs, balance)
- Planks (core strength)
- Burpees (full body cardio)

**Creating Your Routine**
1. Warm up for 5-10 minutes
2. Perform 3-4 exercises for 3 sets each
3. Rest 30-60 seconds between sets
4. Cool down with stretching

**Weekly Schedule**
- Monday: Upper body focus
- Tuesday: Cardio/HIIT
- Wednesday: Lower body focus
- Thursday: Core and flexibility
- Friday: Full body circuit
- Weekend: Active recovery (walking, yoga)

Consistency is key. Start with 20-30 minute sessions and gradually increase duration and intensity as you build fitness.`,
    related_posts: [],
    isActive: true,
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
    content: `Creating a balanced meal plan doesn't have to be complicated. Follow these evidence-based principles for optimal nutrition:

**The Balanced Plate Method**
- 1/2 plate: Non-starchy vegetables (broccoli, spinach, peppers)
- 1/4 plate: Lean protein (chicken, fish, tofu, legumes)
- 1/4 plate: Complex carbohydrates (quinoa, brown rice, sweet potato)
- Add healthy fats (avocado, nuts, olive oil)

**Macronutrient Breakdown**
- Carbohydrates: 45-65% of total calories
- Protein: 10-35% of total calories
- Fats: 20-35% of total calories

**Meal Planning Tips**
1. Plan your meals weekly
2. Prep ingredients in advance
3. Include variety to prevent boredom
4. Listen to your hunger cues
5. Stay hydrated throughout the day

**Sample Day**
- Breakfast: Oatmeal with berries and nuts
- Lunch: Quinoa salad with grilled chicken
- Snack: Greek yogurt with fruit
- Dinner: Baked salmon with roasted vegetables

Remember, the best diet is one you can maintain long-term. Focus on progress, not perfection.`,
    related_posts: [],
    isActive: true,
    views: 156,
  }
];

async function migrateBlogsToFirebase() {
  try {
    console.log("🚀 Starting blog migration to Firebase...");
    
    for (const blog of sampleBlogs) {
      const blogData = {
        ...blog,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      const docRef = await db.collection("blogs").add(blogData);
      console.log(`✅ Migrated blog: "${blog.title}" with ID: ${docRef.id}`);
    }
    
    console.log("🎉 Blog migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error migrating blogs:", error);
    process.exit(1);
  }
}

migrateBlogsToFirebase();