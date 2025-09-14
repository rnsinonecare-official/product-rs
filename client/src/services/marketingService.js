// Marketing service for email and WhatsApp consent management
class MarketingService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'https://api.yourapp.com';
  }

  // Save user consent for marketing communications
  async saveUserConsent(userData) {
    try {
      const consentData = {
        userId: userData.id || userData.email,
        email: userData.email,
        phone: userData.phone,
        emailConsent: userData.emailConsent || false,
        whatsappConsent: userData.whatsappConsent || false,
        consentDate: new Date().toISOString(),
        userProfile: {
          name: userData.name,
          healthConditions: userData.healthConditions,
          dietType: userData.dietType,
          fitnessGoal: userData.fitnessGoal
        }
      };

      // In a real app, this would be an API call
      // const response = await fetch(`${this.apiUrl}/marketing/consent`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(consentData)
      // });

      // For now, store in localStorage for demo purposes
      const existingConsents = JSON.parse(localStorage.getItem('marketingConsents') || '[]');
      const updatedConsents = [...existingConsents.filter(c => c.userId !== consentData.userId), consentData];
      localStorage.setItem('marketingConsents', JSON.stringify(updatedConsents));

      console.log('Marketing consent saved:', consentData);
      return { success: true, data: consentData };
    } catch (error) {
      console.error('Error saving marketing consent:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user consent status
  async getUserConsent(userId) {
    try {
      const consents = JSON.parse(localStorage.getItem('marketingConsents') || '[]');
      const userConsent = consents.find(c => c.userId === userId);
      return { success: true, data: userConsent };
    } catch (error) {
      console.error('Error fetching user consent:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user consent
  async updateUserConsent(userId, consentUpdates) {
    try {
      const consents = JSON.parse(localStorage.getItem('marketingConsents') || '[]');
      const consentIndex = consents.findIndex(c => c.userId === userId);
      
      if (consentIndex !== -1) {
        consents[consentIndex] = {
          ...consents[consentIndex],
          ...consentUpdates,
          updatedDate: new Date().toISOString()
        };
        localStorage.setItem('marketingConsents', JSON.stringify(consents));
        return { success: true, data: consents[consentIndex] };
      }
      
      return { success: false, error: 'User consent not found' };
    } catch (error) {
      console.error('Error updating user consent:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all users with email consent
  async getEmailConsentUsers() {
    try {
      const consents = JSON.parse(localStorage.getItem('marketingConsents') || '[]');
      const emailUsers = consents.filter(c => c.emailConsent);
      return { success: true, data: emailUsers };
    } catch (error) {
      console.error('Error fetching email consent users:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all users with WhatsApp consent
  async getWhatsAppConsentUsers() {
    try {
      const consents = JSON.parse(localStorage.getItem('marketingConsents') || '[]');
      const whatsappUsers = consents.filter(c => c.whatsappConsent);
      return { success: true, data: whatsappUsers };
    } catch (error) {
      console.error('Error fetching WhatsApp consent users:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email campaign (backend integration ready)
  async sendEmailCampaign(campaignData) {
    try {
      const emailUsers = await this.getEmailConsentUsers();
      
      if (!emailUsers.success) {
        return emailUsers;
      }

      const campaign = {
        id: Date.now().toString(),
        subject: campaignData.subject,
        content: campaignData.content,
        recipients: emailUsers.data.map(u => u.email),
        createdDate: new Date().toISOString(),
        status: 'pending'
      };

      // In a real app, this would trigger email sending
      // const response = await fetch(`${this.apiUrl}/marketing/send-email`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(campaign)
      // });

      // For demo, store campaign in localStorage
      const campaigns = JSON.parse(localStorage.getItem('emailCampaigns') || '[]');
      campaigns.push(campaign);
      localStorage.setItem('emailCampaigns', JSON.stringify(campaigns));

      console.log('Email campaign created:', campaign);
      return { success: true, data: campaign };
    } catch (error) {
      console.error('Error sending email campaign:', error);
      return { success: false, error: error.message };
    }
  }

  // Send WhatsApp campaign (backend integration ready)
  async sendWhatsAppCampaign(campaignData) {
    try {
      const whatsappUsers = await this.getWhatsAppConsentUsers();
      
      if (!whatsappUsers.success) {
        return whatsappUsers;
      }

      const campaign = {
        id: Date.now().toString(),
        message: campaignData.message,
        recipients: whatsappUsers.data.map(u => u.phone),
        createdDate: new Date().toISOString(),
        status: 'pending'
      };

      // In a real app, this would trigger WhatsApp sending
      // const response = await fetch(`${this.apiUrl}/marketing/send-whatsapp`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(campaign)
      // });

      // For demo, store campaign in localStorage
      const campaigns = JSON.parse(localStorage.getItem('whatsappCampaigns') || '[]');
      campaigns.push(campaign);
      localStorage.setItem('whatsappCampaigns', JSON.stringify(campaigns));

      console.log('WhatsApp campaign created:', campaign);
      return { success: true, data: campaign };
    } catch (error) {
      console.error('Error sending WhatsApp campaign:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate personalized content based on user profile
  generatePersonalizedContent(userProfile, templateType = 'general') {
    const templates = {
      general: {
        email: {
          subject: `${userProfile.name}, Your Personalized Health Tips Are Ready!`,
          content: `Hi ${userProfile.name},\n\nBased on your health profile, we've curated some personalized tips for you:\n\n${this.getHealthTips(userProfile)}\n\nStay healthy!\nYour Health Team`
        },
        whatsapp: `Hi ${userProfile.name}! 👋\n\nYour daily health tip: ${this.getHealthTips(userProfile)}\n\nReply STOP to unsubscribe.`
      },
      pcos: {
        email: {
          subject: `${userProfile.name}, New PCOS-Friendly Recipes Available!`,
          content: `Hi ${userProfile.name},\n\nWe've added new PCOS-friendly recipes to help you manage your condition naturally.\n\nCheck out our latest meal plans designed specifically for hormonal balance.\n\nBest regards,\nYour Health Team`
        },
        whatsapp: `Hi ${userProfile.name}! 🌸\n\nNew PCOS-friendly recipes are now available in your app. These are designed to help balance your hormones naturally.\n\nCheck them out now!`
      },
      diabetes: {
        email: {
          subject: `${userProfile.name}, Your Blood Sugar Management Guide`,
          content: `Hi ${userProfile.name},\n\nManaging diabetes can be challenging, but you're not alone. We've prepared a comprehensive guide to help you maintain healthy blood sugar levels.\n\nDownload your personalized meal plan now.\n\nStay strong,\nYour Health Team`
        },
        whatsapp: `Hi ${userProfile.name}! 📊\n\nReminder: Track your blood sugar today and check out your personalized meal suggestions in the app.\n\nYou've got this! 💪`
      }
    };

    const healthConditions = userProfile.healthConditions || [];
    
    if (healthConditions.includes('pcos')) {
      return templates.pcos;
    } else if (healthConditions.includes('diabetes')) {
      return templates.diabetes;
    } else {
      return templates.general;
    }
  }

  getHealthTips(userProfile) {
    const tips = {
      pcos: [
        "Include cinnamon in your diet to help regulate blood sugar",
        "Practice stress-reduction techniques like yoga or meditation",
        "Choose complex carbs over simple sugars"
      ],
      diabetes: [
        "Monitor your blood sugar regularly",
        "Stay hydrated throughout the day",
        "Include fiber-rich foods in every meal"
      ],
      general: [
        "Drink plenty of water throughout the day",
        "Include colorful vegetables in your meals",
        "Get adequate sleep for better metabolism"
      ]
    };

    const conditions = userProfile.healthConditions || [];
    
    if (conditions.includes('pcos')) {
      return tips.pcos[Math.floor(Math.random() * tips.pcos.length)];
    } else if (conditions.includes('diabetes')) {
      return tips.diabetes[Math.floor(Math.random() * tips.diabetes.length)];
    } else {
      return tips.general[Math.floor(Math.random() * tips.general.length)];
    }
  }
}

const marketingService = new MarketingService();
export default marketingService;