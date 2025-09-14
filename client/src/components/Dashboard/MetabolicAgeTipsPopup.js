import React from 'react';
import { motion } from 'framer-motion';

const MetabolicAgeTipsPopup = ({ onClose, userProfile }) => {
  const getPersonalizedTips = () => {
    const tips = {
      general: [
        "🏃‍♂️ Increase your daily physical activity - aim for 150 minutes of moderate exercise per week",
        "💪 Add strength training 2-3 times per week to build lean muscle mass",
        "🥗 Focus on whole foods: lean proteins, vegetables, fruits, and whole grains",
        "💧 Stay hydrated - drink at least 8 glasses of water daily",
        "😴 Get 7-9 hours of quality sleep each night",
        "🧘‍♀️ Practice stress management through meditation or yoga",
        "🚭 Avoid smoking and limit alcohol consumption",
        "⏰ Try intermittent fasting (consult your doctor first)"
      ],
      younger: [
        "🎉 Congratulations! Your metabolism is younger than your age!",
        "✅ Keep up your current healthy lifestyle",
        "🔄 Maintain your exercise routine and healthy eating habits",
        "📈 Consider adding variety to your workouts to continue challenging your body",
        "🎯 Focus on maintaining your current weight and muscle mass",
        "🧠 Keep learning new skills to maintain cognitive health"
      ],
      older: [
        "⚠️ Your metabolic age is higher than your chronological age",
        "🚀 Don't worry - you can improve this with lifestyle changes!",
        "🏋️‍♀️ Prioritize strength training to build muscle and boost metabolism",
        "🥘 Focus on protein-rich foods to support muscle maintenance",
        "⚡ Try High-Intensity Interval Training (HIIT) 2-3 times per week",
        "🌱 Eat more fiber-rich foods to improve digestion and metabolism",
        "☕ Consider green tea or coffee before workouts for a metabolic boost",
        "📊 Track your progress and celebrate small improvements"
      ],
      same: [
        "✅ Your metabolic age matches your chronological age",
        "📈 There's room for improvement to make your metabolism younger!",
        "🎯 Set specific fitness goals to challenge your body",
        "🔄 Vary your exercise routine every 4-6 weeks",
        "🥗 Optimize your nutrition with more whole foods",
        "💤 Improve sleep quality for better recovery and metabolism"
      ]
    };

    const comparison = userProfile?.metabolicComparison || 'same';
    const specificTips = tips[comparison] || tips.same;
    const generalTips = tips.general.slice(0, 4); // Get first 4 general tips

    return [...specificTips, ...generalTips];
  };

  const getMetabolicAgeAdvice = () => {
    const age = userProfile?.age || 0;
    const metabolicAge = userProfile?.metabolicAge || age;
    const difference = metabolicAge - age;

    if (difference < -5) {
      return {
        title: "Excellent Metabolic Health! 🌟",
        message: "Your metabolism is significantly younger than your age. You're doing great!",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200"
      };
    } else if (difference < -2) {
      return {
        title: "Good Metabolic Health! 💚",
        message: "Your metabolism is younger than your age. Keep up the good work!",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200"
      };
    } else if (difference <= 2) {
      return {
        title: "Average Metabolic Health 📊",
        message: "Your metabolic age is close to your chronological age. There's room for improvement!",
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200"
      };
    } else if (difference <= 5) {
      return {
        title: "Needs Improvement ⚠️",
        message: "Your metabolism is older than your age. Focus on the tips below to improve it!",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200"
      };
    } else {
      return {
        title: "Significant Improvement Needed 🚨",
        message: "Your metabolic age is much higher than your chronological age. Start with small changes!",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200"
      };
    }
  };

  const advice = getMetabolicAgeAdvice();
  const tips = getPersonalizedTips();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="metabolic-age-title"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2
              id="metabolic-age-title"
              className="text-xl sm:text-2xl font-bold text-gray-800 pr-4"
            >
              🧬 Metabolic Age Insights
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Close metabolic age insights"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Current Status */}
          <div className={`p-4 sm:p-6 rounded-xl border-2 ${advice.bgColor}`}>
            <h3 className={`text-lg sm:text-xl font-semibold ${advice.color} mb-3`}>
              {advice.title}
            </h3>
            <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">{advice.message}</p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Your Age</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{userProfile?.age || 'N/A'}</p>
                <p className="text-xs text-gray-500">years</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Metabolic Age</p>
                <p className={`text-xl sm:text-2xl font-bold ${advice.color}`}>
                  {userProfile?.metabolicAge || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">years</p>
              </div>
            </div>
          </div>

          {/* What is Metabolic Age */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              🤔 What is Metabolic Age?
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Metabolic age compares your basal metabolic rate (BMR) to the average BMR of people your chronological age.
              It's calculated using factors like your BMR efficiency, body composition (BMI), activity level, and age-related
              metabolic changes. A lower metabolic age indicates better metabolic health.
            </p>
          </div>

          {/* Calculation Factors */}
          <div className="bg-blue-50 p-4 sm:p-6 rounded-xl">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              📊 How We Calculate Your Metabolic Age
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm sm:text-base text-gray-700">BMR Efficiency (40% weight)</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm sm:text-base text-gray-700">Body Composition/BMI (30% weight)</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                <span className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm sm:text-base text-gray-700">Activity Level (20% weight)</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                <span className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm sm:text-base text-gray-700">Age-related Decline (10% weight)</span>
              </div>
            </div>
          </div>

          {/* Personalized Tips */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
              💡 Personalized Tips to Improve Your Metabolic Age
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <span className="text-blue-500 font-semibold text-sm sm:text-base mt-0.5 flex-shrink-0">
                    {index + 1}.
                  </span>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">
                    {tip}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-green-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              🎯 Your 30-Day Action Plan
            </h3>
            <div className="space-y-3 text-sm sm:text-base text-gray-700">
              <div className="flex items-start space-x-3">
                <span className="text-green-600 font-semibold flex-shrink-0">📅</span>
                <p><strong className="text-green-700">Week 1-2:</strong> Start with 20-30 minutes of daily walking and improve sleep schedule</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-semibold flex-shrink-0">💪</span>
                <p><strong className="text-blue-700">Week 3-4:</strong> Add 2 strength training sessions and optimize nutrition</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 font-semibold flex-shrink-0">🎯</span>
                <p><strong className="text-purple-700">Ongoing:</strong> Track progress, stay consistent, and gradually increase intensity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
              💡 <strong>Remember:</strong> Small, consistent changes lead to big improvements over time.
              Consult with healthcare professionals before making significant lifestyle changes.
            </p>
            <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Personalized</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Evidence-based</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>Actionable</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MetabolicAgeTipsPopup;