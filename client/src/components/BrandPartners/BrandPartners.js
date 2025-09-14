import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Award } from 'lucide-react';

// Import brand partner images
import asset2 from '../../images/Asset 2.png';
import hhLogo from '../../images/HH.png';
import rainscareLogo from '../../images/RAINSCARE WOB.png';
import siriLogo from '../../images/SIRI LOGO.png';

const BrandPartners = () => {
  // Brand partners data
  const brandPartners = [
    { id: 1, name: 'Asset 2', logo: asset2, alt: 'Asset 2 Partner' },
    { id: 2, name: 'HH', logo: hhLogo, alt: 'HH Partner' },
    { id: 3, name: 'SIRI', logo: siriLogo, alt: 'SIRI Partner' },
    // Duplicate for seamless loop
    { id: 4, name: 'Asset 2', logo: asset2, alt: 'Asset 2 Partner' },
    { id: 5, name: 'HH', logo: hhLogo, alt: 'HH Partner' },
    { id: 6, name: 'SIRI', logo: siriLogo, alt: 'SIRI Partner' },
  ];

  return (
    <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-8 sm:py-12 lg:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-sage to-light-green rounded-full flex items-center justify-center mr-3"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-sage to-light-green bg-clip-text text-transparent">
              Our Brand Partners
            </h2>
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto"
          >
            Trusted by leading healthcare and wellness organizations worldwide
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex items-center justify-center space-x-6 mt-6"
          >
            <div className="flex items-center space-x-2 text-gray-500">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Trusted Partners</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Award className="w-4 h-4 text-sage" />
              <span className="text-sm font-medium">Quality Assured</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Moving Logos Container */}
        <div className="relative">
          {/* Gradient Overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
          
          {/* Moving Logos */}
          <div className="overflow-hidden">
            <motion.div
              className="flex items-center space-x-8 sm:space-x-12 lg:space-x-16"
              animate={{
                x: [0, -50 * brandPartners.length / 2]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {brandPartners.map((partner, index) => (
                <motion.div
                  key={`${partner.id}-${index}`}
                  className="flex-shrink-0 group"
                  whileHover={{ 
                    scale: 1.1,
                    y: -5
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-4 border border-gray-100 group-hover:border-sage/30">
                    <img
                      src={partner.logo}
                      alt={partner.alt}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Partner Name (appears on hover) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span className="text-sm font-medium text-gray-600">
                      {partner.name}
                    </span>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-12"
        >
          <p className="text-gray-500 text-xs sm:text-sm">
            Join our growing network of healthcare partners and wellness advocates
          </p>
          
          {/* Partnership CTA */}
          <motion.button
            className="mt-4 px-6 py-2 bg-gradient-to-r from-sage to-light-green text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(144, 238, 144, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            Become a Partner
          </motion.button>
        </motion.div>
      </div>

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-sage/5 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-16 h-16 bg-light-green/5 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </div>
  );
};

export default BrandPartners;