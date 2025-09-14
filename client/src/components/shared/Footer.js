import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Shield,
  FileText,
  HelpCircle,
  Users,
  Stethoscope,
  Apple,
  Smartphone,
  Award,
  Sparkles
} from 'lucide-react';
import rainscareLogo from '../../images/RAINSCARE WOB.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Features",
      items: [
        { name: "Food Analysis", href: "/food-analysis", icon: Apple },
        { name: "Recipe Generator", href: "/recipes", icon: Stethoscope },
        { name: "Progress Tracker", href: "/progress", icon: Heart },
        { name: "Community", href: "/community", icon: Users }
      ]
    },
    {
      title: "Support",
      items: [
        { name: "Help Center", href: "#", icon: HelpCircle },
        { name: "Privacy Policy", href: "#", icon: Shield },
        { name: "Terms of Service", href: "/terms", icon: FileText },
        { name: "Contact Support", href: "#", icon: Mail }
      ]
    },
    {
      title: "Connect",
      items: [
        { name: "Download App", href: "#", icon: Smartphone },
        { name: "Newsletter", href: "#", icon: Mail },
        { name: "Blog", href: "#", icon: FileText },
        { name: "Community Forum", href: "/community", icon: Users }
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/share/19HS1Ar2b1/", color: "hover:text-blue-600" },
    { name: "Twitter", icon: Twitter, href: "https://x.com/gorainscare", color: "hover:text-blue-400" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/gorainscare?igsh=MWRhaXphZ2hjYmRrdA==", color: "hover:text-pink-600" },
    { name: "LinkedIn", icon: Linkedin, href: "#", color: "hover:text-blue-700" }
  ];

  const contactInfo = [
    { icon: Mail, text: "support@rainscare.com", href: "mailto:support@rainscare.com" },
    { icon: Phone, text: "+91 6363656115", href: "tel:+91 6363656115" },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3">
          {/* Brand Section */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-lg">
                <img 
                  src={rainscareLogo} 
                  alt="Rainscare Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Rainscare
              </span>
            </div>
            
            {/* Social Links */}
            <div className="flex justify-center space-x-2 mb-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className={`w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color} hover:bg-gray-700 hover:scale-110 hover:shadow-lg`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>



          {/* Footer Links & Contact Combined */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Footer Links */}
            {footerSections.map((section, sectionIndex) => (
              <div key={section.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-1">
                    <Award className="w-3 h-3 text-green-400" />
                    <span>{section.title}</span>
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <motion.li
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                        viewport={{ once: true }}
                      >
                        <a
                          href={item.href}
                          className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors duration-300 group py-0.5 px-1 rounded hover:bg-gray-800/30"
                        >
                          <item.icon className="w-2.5 h-2.5 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-xs">{item.name}</span>
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            ))}
            
            {/* Contact Information */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-1">
                  <Award className="w-3 h-3 text-green-400" />
                  <span>Get in Touch</span>
                </h3>
                <div className="space-y-1">
                  {contactInfo.map((contact, index) => (
                    <motion.a
                      key={index}
                      href={contact.href}
                      className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors duration-300 group py-0.5 px-1 rounded hover:bg-gray-800/30"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
                      viewport={{ once: true }}
                    >
                      <contact.icon className="w-2.5 h-2.5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs">{contact.text}</span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <motion.div
              className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3">
                <p className="text-gray-400 text-xs">
                  © {currentYear} Rainscare. All rights reserved.
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Made with</span>
                  <Heart className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                  <span>for your health</span>
                  <Sparkles className="w-2.5 h-2.5 text-yellow-400 animate-pulse" />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <button className="hover:text-green-400 transition-colors duration-300">
                  Privacy Policy
                </button>
                <a href="/terms" className="hover:text-green-400 transition-colors duration-300">
                  Terms of Service
                </a>
                <button className="hover:text-green-400 transition-colors duration-300">
                  Cookie Policy
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;