import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

const TermsConditions = ({ onClose }) => {
  const sections = [
    {
      title: "Data Collection & Privacy",
      icon: Lock,
      content: [
        "We collect personal health information to provide personalized nutrition recommendations",
        "Your data is encrypted and stored securely in compliance with healthcare standards",
        "We never share your personal health data with third parties without consent",
        "You can request data deletion at any time through your profile settings"
      ]
    },
    {
      title: "Health Recommendations",
      icon: AlertTriangle,
      content: [
        "All nutritional advice is for informational purposes only",
        "Consult healthcare professionals before making significant dietary changes",
        "Our recommendations are based on general health principles, not medical diagnosis",
        "Individual results may vary based on personal health conditions"
      ]
    },
    {
      title: "User Responsibilities",
      icon: Users,
      content: [
        "Provide accurate health information for better recommendations",
        "Use the platform responsibly and follow suggested guidelines",
        "Report any technical issues or concerns promptly",
        "Respect other users and maintain community standards"
      ]
    },
    {
      title: "Service Limitations",
      icon: Eye,
      content: [
        "Service availability may vary based on location and technical factors",
        "We strive for 99.9% uptime but cannot guarantee uninterrupted service",
        "Features may be updated or modified to improve user experience",
        "Some advanced features may require subscription in the future"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-sage" />
              <h2 className="text-2xl font-bold text-gray-800">Terms & Conditions</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <section.icon className="w-5 h-5 text-sage" />
                  <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-sage/10 to-light-green/10 rounded-2xl">
            <p className="text-sm text-gray-600 text-center">
              Last updated: {new Date().toLocaleDateString()} | Version 1.0
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-sage text-white rounded-2xl hover:bg-sage/90 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsConditions;