/**
 * Unified Metabolic Age Calculation Utility
 * This ensures consistent metabolic age calculations across the entire application
 */

/**
 * Calculate metabolic age based on various health factors
 * @param {number} age - Chronological age
 * @param {string} gender - 'male' or 'female'
 * @param {number} height - Height in cm
 * @param {number} weight - Weight in kg
 * @param {string} activityLevel - Activity level ('sedentary', 'light', 'moderate', 'active', 'very_active')
 * @param {number} bodyFatPercentage - Body fat percentage (optional)
 * @param {number} muscleMass - Muscle mass in kg (optional)
 * @returns {object} Metabolic age calculation results
 */
export const calculateMetabolicAge = (
  age,
  gender,
  height,
  weight,
  activityLevel = 'moderate',
  bodyFatPercentage = null,
  muscleMass = null
) => {
  try {
    // Validate inputs
    if (!age || !gender || !height || !weight) {
      // eslint-disable-next-line no-console
      console.warn('Missing required parameters for metabolic age calculation');
      return null;
    }

    // Ensure numeric values
    age = Number(age);
    height = Number(height);
    weight = Number(weight);

    if (isNaN(age) || isNaN(height) || isNaN(weight) || age <= 0 || height <= 0 || weight <= 0) {
      // eslint-disable-next-line no-console
      console.warn('Invalid numeric values for metabolic age calculation');
      return null;
    }

    // Validate gender
    if (!['male', 'female'].includes(gender.toLowerCase())) {
      // eslint-disable-next-line no-console
      console.warn('Invalid gender value for metabolic age calculation');
      return null;
    }

    // Calculate BMR using Harris-Benedict Equation (Revised)
    const bmr = gender.toLowerCase() === 'male'
      ? (88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age))
      : (447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // Enhanced metabolic age calculation using multiple factors
    let metabolicAgeScore = 0;

    // 1. BMR Efficiency Score (40% weight)
    const expectedBMR = gender.toLowerCase() === 'male'
      ? (88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age))
      : (447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));

    const bmrEfficiency = bmr / expectedBMR;

    if (bmrEfficiency > 1.15) metabolicAgeScore -= 8;      // Excellent metabolism
    else if (bmrEfficiency > 1.05) metabolicAgeScore -= 4; // Good metabolism
    else if (bmrEfficiency < 0.85) metabolicAgeScore += 8; // Slow metabolism
    else if (bmrEfficiency < 0.95) metabolicAgeScore += 4; // Below average

    // 2. Body Composition Score (30% weight)
    if (bmi < 18.5) {
      metabolicAgeScore += 6; // Underweight - potential muscle loss
    } else if (bmi >= 18.5 && bmi < 25) {
      metabolicAgeScore -= 2; // Healthy weight
    } else if (bmi >= 25 && bmi < 30) {
      metabolicAgeScore += 4; // Overweight
    } else if (bmi >= 30 && bmi < 35) {
      metabolicAgeScore += 8; // Obese Class I
    } else if (bmi >= 35) {
      metabolicAgeScore += 12; // Obese Class II+
    }

    // 3. Activity Level Score (20% weight)
    const activityScores = {
      sedentary: 6,
      light: 2,
      moderate: 0,
      active: -3,
      very_active: -6
    };
    metabolicAgeScore += activityScores[activityLevel] || 0;

    // 4. Age-related metabolism decline (10% weight)
    // Natural metabolism decline is about 1-2% per decade after 30
    if (age > 30) {
      const decadesPast30 = (age - 30) / 10;
      const expectedDecline = decadesPast30 * 1.5; // 1.5% per decade
      const actualDecline = (1 - bmrEfficiency) * 100;

      if (actualDecline > expectedDecline + 5) {
        metabolicAgeScore += 4; // Faster than expected decline
      } else if (actualDecline < expectedDecline - 5) {
        metabolicAgeScore -= 4; // Slower than expected decline
      }
    }

    // 5. Body composition adjustments (if available)
    if (bodyFatPercentage && muscleMass) {
      const idealBodyFat = gender.toLowerCase() === 'male' ? 15 : 25;
      const bodyFatDifference = bodyFatPercentage - idealBodyFat;

      if (bodyFatDifference > 10) metabolicAgeScore += 3;
      else if (bodyFatDifference > 5) metabolicAgeScore += 1;
      else if (bodyFatDifference < -5) metabolicAgeScore -= 2;

      // Muscle mass factor (higher muscle mass = better metabolism)
      const expectedMuscleMass = weight * (gender.toLowerCase() === 'male' ? 0.45 : 0.35);
      if (muscleMass > expectedMuscleMass * 1.1) metabolicAgeScore -= 2;
      else if (muscleMass < expectedMuscleMass * 0.9) metabolicAgeScore += 2;
    }

    // Calculate final metabolic age (constrained between 18-80)
    const metabolicAge = Math.max(18, Math.min(80, age + metabolicAgeScore));

    // Calculate metabolic health score (0-100)
    const healthScore = Math.max(0, Math.min(100, 100 - (metabolicAgeScore + 20)));

    // Calculate TDEE (Total Daily Energy Expenditure)
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    // Determine comparison with chronological age
    let comparison, comparisonColor, comparisonIcon;
    if (metabolicAge < age - 2) {
      comparison = 'younger';
      comparisonColor = 'text-green-600';
      comparisonIcon = '🎉';
    } else if (metabolicAge > age + 2) {
      comparison = 'older';
      comparisonColor = 'text-red-600';
      comparisonIcon = '⚠️';
    } else {
      comparison = 'same';
      comparisonColor = 'text-blue-600';
      comparisonIcon = '✅';
    }

    // Detailed factors breakdown for insights
    const factors = {
      bmrEfficiency: {
        value: bmrEfficiency,
        score: bmrEfficiency > 1.15 ? -8 : bmrEfficiency > 1.05 ? -4 : bmrEfficiency < 0.85 ? 8 : bmrEfficiency < 0.95 ? 4 : 0,
        description: bmrEfficiency > 1.15 ? 'Excellent metabolism' :
                     bmrEfficiency > 1.05 ? 'Good metabolism' :
                     bmrEfficiency < 0.85 ? 'Slow metabolism' :
                     bmrEfficiency < 0.95 ? 'Below average metabolism' : 'Average metabolism'
      },
      bodyComposition: {
        bmi: bmi,
        score: bmi < 18.5 ? 6 : bmi < 25 ? -2 : bmi < 30 ? 4 : bmi < 35 ? 8 : 12,
        description: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy weight' : bmi < 30 ? 'Overweight' : 'Obese'
      },
      activityLevel: {
        level: activityLevel,
        score: activityScores[activityLevel] || 0,
        description: `${activityLevel.charAt(0).toUpperCase() + activityLevel.slice(1)} activity level`
      }
    };

    return {
      metabolicAge: Math.round(metabolicAge),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      healthScore: Math.round(healthScore),
      comparison,
      comparisonColor,
      comparisonIcon,
      bmrEfficiency: Math.round(bmrEfficiency * 100) / 100,
      factors,
      bmi: Math.round(bmi * 10) / 10
    };
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Error calculating metabolic age:', error);
  return null;
}
};

/**
 * Get BMI category and color
 * @param {number} bmi - BMI value
 * @returns {object} BMI category information
 */
export const getBMIInfo = (bmi) => {
  if (bmi < 18.5) {
    return {
      category: 'Underweight',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'You may need to gain weight for optimal health'
    };
  } else if (bmi < 25) {
    return {
      category: 'Normal',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'You have a healthy weight range'
    };
  } else if (bmi < 30) {
    return {
      category: 'Overweight',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Consider losing weight for better health'
    };
  } else {
    return {
      category: 'Obese',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Weight loss is recommended for better health'
    };
  }
};

/**
 * Get metabolic age insights and recommendations
 * @param {number} metabolicAge - Calculated metabolic age
 * @param {number} chronologicalAge - Actual age
 * @param {object} factors - Metabolic factors breakdown
 * @returns {object} Insights and recommendations
 */
export const getMetabolicAgeInsights = (metabolicAge, chronologicalAge, factors) => {
  const difference = metabolicAge - chronologicalAge;
  
  let insights = [];
  let recommendations = [];
  
  if (difference <= -5) {
    insights.push("🎉 Excellent! Your metabolism is significantly younger than your age.");
    recommendations.push("Keep up your current lifestyle and activity level.");
  } else if (difference <= -2) {
    insights.push("✅ Great! Your metabolism is younger than your chronological age.");
    recommendations.push("Maintain your current healthy habits.");
  } else if (difference <= 2) {
    insights.push("👍 Good! Your metabolic age matches your chronological age.");
    recommendations.push("Consider small improvements in diet and exercise.");
  } else if (difference <= 5) {
    insights.push("⚠️ Your metabolism is aging faster than expected.");
    recommendations.push("Focus on increasing physical activity and improving diet quality.");
  } else {
    insights.push("🚨 Your metabolism needs attention - it's significantly older than your age.");
    recommendations.push("Consider consulting a healthcare provider and making significant lifestyle changes.");
  }
  
  // Add specific recommendations based on factors
  if (factors.bmrEfficiency.value < 0.95) {
    recommendations.push("💪 Build muscle mass through strength training to boost metabolism.");
  }
  
  if (factors.bodyComposition.bmi > 25) {
    recommendations.push("🥗 Focus on achieving a healthy weight through balanced nutrition.");
  }
  
  if (factors.activityLevel.level === 'sedentary') {
    recommendations.push("🏃‍♂️ Increase daily physical activity - even light exercise helps!");
  }
  
  return {
    insights,
    recommendations,
    severity: difference > 5 ? 'high' : difference > 2 ? 'medium' : 'low'
  };
};

const metabolicCalculations = {
  calculateMetabolicAge,
  getBMIInfo,
  getMetabolicAgeInsights
};

export default metabolicCalculations;