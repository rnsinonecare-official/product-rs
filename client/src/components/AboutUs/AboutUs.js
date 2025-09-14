import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import PageBackground from '../shared/PageBackground';
import './AboutUs.css';
import { 
  Users, 
  Eye, 
  Target, 
  Sparkles, 
  Globe, 
  Zap, 
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  Award,
  Lightbulb,
  Rocket,
  Compass,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const AboutUs = () => {
  const [activeCard, setActiveCard] = useState(null);
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, { threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [inView, controls]);

  const aboutData = [
    {
      id: 'about',
      title: 'About Us',
      icon: Users,
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-green-50',
      darkBgGradient: 'from-emerald-900/20 to-green-900/20',
      description: 'At Rainscare, we go beyond generic diets. We create personalized health plans based on your unique needs—from PCOD to allergies. Your holistic health journey starts here.',
      features: [
        'Personalized Health Solutions',
        'AI-Powered Recommendations',
        'Expert Nutritionist Support',
        'Comprehensive Health Tracking'
      ],
      stats: { number: '10K+', label: 'Happy Users' },
      accentIcon: Sparkles
    },
    {
      id: 'vision',
      title: 'Our Vision',
      icon: Eye,
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      darkBgGradient: 'from-blue-900/20 to-indigo-900/20',
      description: 'To be the world\'s leading personalized health platform, making a healthier, vibrant life accessible and enjoyable for everyone.',
      features: [
        'Global Health Leadership',
        'Innovative Technology',
        'Accessible Healthcare',
        'Sustainable Wellness'
      ],
      stats: { number: '50+', label: 'Countries' },
      accentIcon: Globe
    },
    {
      id: 'mission',
      title: 'Our Mission',
      icon: Target,
      gradient: 'from-purple-500 via-pink-500 to-rose-600',
      bgGradient: 'from-purple-50 to-pink-50',
      darkBgGradient: 'from-purple-900/20 to-pink-900/20',
      description: 'We empower individuals to achieve their health goals by delivering personalized nutrition, actionable data, and integrated healthcare in one platform.',
      features: [
        'Empowering Health Goals',
        'Data-Driven Insights',
        'Integrated Healthcare',
        'Continuous Innovation'
      ],
      stats: { number: '95%', label: 'Success Rate' },
      accentIcon: Zap
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      image: '/api/placeholder/150/150',
      bio: 'Leading nutritionist with 15+ years of experience in personalized healthcare.',
      specialties: ['Clinical Nutrition', 'PCOD Management', 'Metabolic Health'],
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 2,
      name: 'Alex Chen',
      role: 'Head of AI & Technology',
      image: '/api/placeholder/150/150',
      bio: 'AI expert specializing in healthcare applications and machine learning.',
      specialties: ['Machine Learning', 'Health Analytics', 'AI Development'],
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 3,
      name: 'Dr. Priya Sharma',
      role: 'Lead Nutritionist',
      image: '/api/placeholder/150/150',
      bio: 'Certified nutritionist focused on holistic wellness and dietary planning.',
      specialties: ['Diet Planning', 'Wellness Coaching', 'Preventive Care'],
      gradient: 'from-pink-500 to-rose-600'
    }
  ];

  const companyStats = [
    { icon: Users, label: 'Active Users', value: '50,000+', color: 'text-blue-600' },
    { icon: Globe, label: 'Countries', value: '25+', color: 'text-green-600' },
    { icon: Award, label: 'Success Rate', value: '95%', color: 'text-purple-600' },
    { icon: Calendar, label: 'Years Experience', value: '8+', color: 'text-orange-600' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      <PageBackground variant="about" />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Compass className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">About Rainscare</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent shimmer-text">
                  Transforming Lives
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-glow">
                  Through Personalized Health
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
                We're on a mission to revolutionize healthcare by making personalized nutrition and wellness 
                accessible to everyone, everywhere. Join us in creating a healthier world.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                {companyStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main About Section */}
        <section 
          ref={ref}
          className="about-section relative py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pulse-glow"
              variants={pulseVariants}
              animate="animate"
            />
            <motion.div 
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-3xl pulse-glow"
              variants={pulseVariants}
              animate="animate"
              style={{ animationDelay: '1.5s' }}
            />
            
            {/* Particle System */}
            <div className="particle-container">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="particle" />
              ))}
            </div>
          </div>

          {/* Floating Icons */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              className="absolute top-20 left-10 text-blue-300/30 floating-element"
              variants={floatingVariants}
              animate="animate"
            >
              <Heart className="w-8 h-8" />
            </motion.div>
            <motion.div 
              className="absolute top-32 right-20 text-green-300/30 floating-element"
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: '2s' }}
            >
              <Star className="w-6 h-6" />
            </motion.div>
            <motion.div 
              className="absolute bottom-32 left-20 text-purple-300/30 floating-element"
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: '4s' }}
            >
              <Award className="w-7 h-7" />
            </motion.div>
            <motion.div 
              className="absolute bottom-20 right-10 text-pink-300/30 floating-element"
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: '1s' }}
            >
              <Lightbulb className="w-6 h-6" />
            </motion.div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Cards Grid */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
              variants={containerVariants}
              initial="hidden"
              animate={controls}
            >
              {aboutData.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`group relative glass-morphism rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl card-hover-effect cursor-pointer overflow-hidden ${
                    activeCard === item.id ? 'scale-105' : ''
                  }`}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -10,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  onHoverStart={() => setActiveCard(item.id)}
                  onHoverEnd={() => setActiveCard(null)}
                >
                  {/* Background Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.darkBgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 card-content">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <motion.div
                        className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center shadow-lg icon-spin-glow`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <item.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <motion.div
                        className="flex items-center space-x-2 text-gray-500 group-hover:text-gray-700"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      >
                        <item.accentIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.stats.number}</span>
                        <span className="text-xs">{item.stats.label}</span>
                      </motion.div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                      {item.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      {item.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          className="flex items-center space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + featureIndex * 0.1 + 0.5 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 group-hover:text-gray-800 transition-colors">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <motion.button
                      className={`w-full bg-gradient-to-r ${item.gradient} text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl button-hover-effect transition-all duration-300 group/btn`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>

                  {/* Hover Effect Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/30 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [-20, -40, -20],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Meet Our Team
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our diverse team of experts is dedicated to revolutionizing healthcare through innovation and compassion.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  className="group relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="text-center">
                    <motion.div
                      className={`w-24 h-24 bg-gradient-to-r ${member.gradient} rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-6">{member.bio}</p>
                    
                    <div className="space-y-2">
                      {member.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium mr-2 mb-2"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Get In Touch
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ready to start your health journey? We're here to help you every step of the way.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { icon: Phone, title: 'Call Us', info: '+91 6363656115' },
                { icon: Mail, title: 'Email Us', info: 'support@rainscare.com' }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <contact.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{contact.title}</h3>
                  <p className="text-gray-600">{contact.info}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl button-hover-effect gradient-shift transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-6 h-6" />
                <span className="font-semibold text-lg">Start Your Health Journey Today</span>
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;