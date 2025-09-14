import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../shared/AnimatedButton';
import DatePicker from 'react-datepicker';
import { useUser } from '../../context/UserContext';
import PageBackground from '../shared/PageBackground';
import {
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  Star,
  Award,
  MapPin,
  Video,
  CheckCircle,
  Heart,
  User,
  Mail,
  X,
  ChevronRight,
  Sparkles,
  Shield,
  Users,
  BookOpen,
  Zap,
  ArrowLeft,
  Search,
  Filter,
  Building2,
  Stethoscope,
  GraduationCap,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';
import './Nutritionist.css';

const Doctors = () => {
  const { userProfile } = useUser();
  const [currentView, setCurrentView] = useState('conditions'); // conditions, doctors, doctorDetails
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState('consultation');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, rating, fee, experience
  const [consultationMode, setConsultationMode] = useState('online'); // online, offline

  // Health Conditions data
  const healthConditions = [
    {
      id: 1,
      name: 'Cholesterol',
      icon: Heart,
      description: 'Manage your levels with expert care',
      doctorCount: 25,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 2,
      name: 'Obesity',
      icon: Users,
      description: 'Achieve healthy weight with professional guidance',
      doctorCount: 32,
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 3,
      name: 'Chronic Disease',
      icon: Shield,
      description: 'Long-term health management solutions',
      doctorCount: 28,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 4,
      name: 'Kidney Disease',
      icon: Stethoscope,
      description: 'Specialized renal nutrition therapy',
      doctorCount: 18,
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 5,
      name: 'Fatty Liver',
      icon: BookOpen,
      description: 'Liver health through targeted nutrition',
      doctorCount: 22,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 6,
      name: 'Cardiovascular Disease',
      icon: Heart,
      description: 'Heart-healthy nutrition programs',
      doctorCount: 30,
      color: 'from-blue-500 to-blue-700'
    }
  ];

  // Dummy doctors data organized by health conditions
  const doctors = {
    1: [ // Cholesterol
      {
        id: 1,
        name: 'Dr. Rajesh Kumar',
        specialization: 'Cholesterol Management Specialist',
        experience: '12 years',
        rating: 4.8,
        reviews: 203,
        location: 'Koramangala, Bengaluru',
        languages: ['English', 'Hindi', 'Tamil'],
        expertise: ['Cholesterol Management', 'Heart Health', 'Lipid Disorders', 'Preventive Cardiology'],
        qualifications: ['MS in Clinical Nutrition', 'Cardiac Nutrition Specialist', 'Lipid Management Certified'],
        consultationFee: '₹1200',
        availability: 'Mon-Sat 10AM-7PM',
        image: '/api/placeholder/150/150',
        bio: 'Specializing in cholesterol management and cardiac nutrition with over a decade of experience in lipid disorders.',
        whatsapp: '+919876543211',
        achievements: ['Cardiac Nutrition Expert', 'Cholesterol Research Publications', '1000+ Success Cases'],
        nextAvailable: 'Tomorrow 10:00 AM'
      },
      {
        id: 2,
        name: 'Dr. Meera Nair',
        specialization: 'Lipid Disorders Specialist',
        experience: '15 years',
        rating: 4.9,
        reviews: 287,
        location: 'Whitefield, Bengaluru',
        languages: ['English', 'Malayalam', 'Kannada'],
        expertise: ['High Cholesterol', 'Triglycerides', 'HDL/LDL Management', 'Heart Disease Prevention'],
        qualifications: ['PhD in Clinical Nutrition', 'Cardiovascular Nutrition Certified'],
        consultationFee: '₹1300',
        availability: 'Tue-Sat 9AM-5PM',
        image: '/api/placeholder/150/150',
        bio: 'Expert in lipid management and cardiovascular nutrition with extensive research in cholesterol therapy.',
        whatsapp: '+919876543214',
        achievements: ['Lipid Management Expert', 'International Speaker', 'Heart Health Pioneer'],
        nextAvailable: 'Tomorrow 11:00 AM'
      },
      {
        id: 3,
        name: 'Dr. Suresh Patel',
        specialization: 'Cardiovascular Doctor',
        experience: '16 years',
        rating: 4.8,
        reviews: 267,
        location: 'BTM Layout, Bengaluru',
        languages: ['English', 'Hindi', 'Gujarati'],
        expertise: ['Cholesterol Control', 'Heart-Healthy Diet', 'Atherosclerosis Prevention'],
        qualifications: ['MS in Cardiovascular Nutrition', 'Heart Health Specialist'],
        consultationFee: '₹1100',
        availability: 'Mon-Sat 8AM-6PM',
        image: '/api/placeholder/150/150',
        bio: 'Specialized cardiovascular doctor with extensive experience in cholesterol management and heart disease prevention.',
        whatsapp: '+919876543218',
        achievements: ['Heart Health Expert', 'Cholesterol Research', 'Community Health Leader'],
        nextAvailable: 'Tomorrow 9:00 AM'
      }
    ],
    2: [ // Obesity
      {
        id: 4,
        name: 'Dr. Anita Joshi',
        specialization: 'Obesity Management Expert',
        experience: '13 years',
        rating: 4.9,
        reviews: 312,
        location: 'Malleshwaram, Bengaluru',
        languages: ['English', 'Hindi', 'Marathi'],
        expertise: ['Obesity Management', 'Metabolic Syndrome', 'Lifestyle Modification', 'Bariatric Nutrition'],
        qualifications: ['PhD in Nutrition', 'Obesity Medicine Specialist', 'Bariatric Nutrition Certified'],
        consultationFee: '₹1000',
        availability: 'Mon-Fri 9AM-7PM',
        image: '/api/placeholder/150/150',
        bio: 'Leading expert in obesity management with proven track record of sustainable weight loss programs.',
        whatsapp: '+919876543217',
        achievements: ['Obesity Expert', '5000+ Transformations', 'Weight Loss Pioneer'],
        nextAvailable: 'Today 3:00 PM'
      },
      {
        id: 5,
        name: 'Dr. Priyanka Jain',
        specialization: 'Weight Management Specialist',
        experience: '9 years',
        rating: 4.7,
        reviews: 156,
        location: 'Hindwadi, Belagavi',
        languages: ['English', 'Hindi', 'Marathi'],
        expertise: ['Sustainable Weight Loss', 'Lifestyle Coaching', 'Behavioral Change', 'Metabolic Health'],
        qualifications: ['MS in Nutrition', 'Lifestyle Medicine Certified', 'Behavioral Nutrition Specialist'],
        consultationFee: '₹750',
        availability: 'Mon-Sat 9AM-7PM',
        image: '/api/placeholder/150/150',
        bio: 'Focused on sustainable weight management through lifestyle modifications and behavioral changes.',
        whatsapp: '+919876543222',
        achievements: ['Lifestyle Coach', '1200+ Success Stories', 'Behavioral Change Expert'],
        nextAvailable: 'Tomorrow 11:00 AM'
      },
      {
        id: 6,
        name: 'Dr. Sunil Kumar',
        specialization: 'Metabolic Health Expert',
        experience: '10 years',
        rating: 4.8,
        reviews: 134,
        location: 'Shivaji Nagar, Davangere',
        languages: ['English', 'Kannada', 'Hindi'],
        expertise: ['Obesity & Diabetes', 'Metabolic Health', 'Lifestyle Diseases', 'Weight Loss Surgery Support'],
        qualifications: ['MS in Metabolic Health', 'Diabetes & Obesity Specialist'],
        consultationFee: '₹800',
        availability: 'Mon-Fri 8AM-7PM',
        image: '/api/placeholder/150/150',
        bio: 'Specializing in obesity management for diabetic patients and metabolic health improvement.',
        whatsapp: '+919876543228',
        achievements: ['Metabolic Health Expert', 'Obesity-Diabetes Specialist', '1000+ Success Cases'],
        nextAvailable: 'Tomorrow 10:00 AM'
      }
    ],
    3: [ // Chronic Disease
      {
        id: 7,
        name: 'Dr. Mohan Rao',
        specialization: 'Chronic Disease Management Specialist',
        experience: '18 years',
        rating: 4.9,
        reviews: 245,
        location: 'Hampankatta, Mangaluru',
        languages: ['English', 'Kannada', 'Tulu'],
        expertise: ['Chronic Disease Management', 'Geriatric Nutrition', 'Multiple Comorbidities', 'Long-term Care'],
        qualifications: ['MD in Geriatrics', 'Chronic Disease Nutrition Certified'],
        consultationFee: '₹1100',
        availability: 'Mon-Sat 8AM-5PM',
        image: '/api/placeholder/150/150',
        bio: 'Senior doctor specializing in chronic disease management and long-term nutritional care.',
        whatsapp: '+919876543224',
        achievements: ['Chronic Care Expert', 'Geriatric Specialist', '25+ Years Experience'],
        nextAvailable: 'Tomorrow 9:00 AM'
      },
      {
        id: 8,
        name: 'Dr. Ashwini Patil',
        specialization: 'Chronic Care Doctor',
        experience: '14 years',
        rating: 4.8,
        reviews: 167,
        location: 'Vidyanagar, Hubli',
        languages: ['English', 'Kannada', 'Hindi', 'Marathi'],
        expertise: ['Cancer Nutrition', 'Autoimmune Disorders', 'Recovery Nutrition', 'Chronic Pain Management'],
        qualifications: ['PhD in Oncology Nutrition', 'Chronic Disease Specialist'],
        consultationFee: '₹1000',
        availability: 'Mon-Fri 9AM-5PM',
        image: '/api/placeholder/150/150',
        bio: 'Specialized in nutritional support for chronic diseases including cancer and autoimmune conditions.',
        whatsapp: '+919876543233',
        achievements: ['Chronic Disease Expert', 'Cancer Support Specialist', 'Recovery Nutrition Pioneer'],
        nextAvailable: 'Tomorrow 10:00 AM'
      }
    ],
    4: [ // Kidney Disease
      {
        id: 9,
        name: 'Dr. Ramesh Kulkarni',
        specialization: 'Renal Nutrition Specialist',
        experience: '14 years',
        rating: 4.6,
        reviews: 189,
        location: 'Tilakwadi, Belagavi',
        languages: ['English', 'Hindi', 'Marathi'],
        expertise: ['Kidney Disease', 'Dialysis Nutrition', 'Renal Diet Planning', 'CKD Management'],
        qualifications: ['PhD in Clinical Nutrition', 'Renal Nutrition Certified'],
        consultationFee: '₹900',
        availability: 'Mon-Fri 9AM-6PM',
        image: '/api/placeholder/150/150',
        bio: 'Expert in renal nutrition with focus on kidney disease management and dialysis support.',
        whatsapp: '+919876543220',
        achievements: ['Renal Nutrition Expert', 'Kidney Care Specialist', 'Dialysis Support Pioneer'],
        nextAvailable: 'Tomorrow 10:00 AM'
      },
      {
        id: 10,
        name: 'Dr. Manjula Gowda',
        specialization: 'Kidney Health Doctor',
        experience: '13 years',
        rating: 4.7,
        reviews: 178,
        location: 'P.J. Extension, Davangere',
        languages: ['English', 'Kannada', 'Hindi'],
        expertise: ['Kidney Stone Prevention', 'Early CKD', 'Nephrology Nutrition', 'Electrolyte Balance'],
        qualifications: ['PhD in Renal Nutrition', 'Nephrology Nutrition Specialist'],
        consultationFee: '₹750',
        availability: 'Mon-Sat 9AM-6PM',
        image: '/api/placeholder/150/150',
        bio: 'Expert in kidney health nutrition, focusing on prevention and early-stage kidney disease management.',
        whatsapp: '+919876543227',
        achievements: ['Kidney Health Expert', 'Prevention Specialist', 'Nephrology Nutrition Pioneer'],
        nextAvailable: 'Today 5:00 PM'
      }
    ],
    5: [ // Fatty Liver
      {
        id: 11,
        name: 'Dr. Shweta Shetty',
        specialization: 'Liver Health Specialist',
        experience: '12 years',
        rating: 4.8,
        reviews: 198,
        location: 'Kadri, Mangaluru',
        languages: ['English', 'Kannada', 'Tulu', 'Hindi'],
        expertise: ['Fatty Liver Disease', 'NAFLD Management', 'Liver Detox', 'Hepatic Nutrition'],
        qualifications: ['PhD in Nutrition', 'Hepatology Nutrition Certified'],
        consultationFee: '₹950',
        availability: 'Mon-Fri 9AM-6PM',
        image: '/api/placeholder/150/150',
        bio: 'Specialist in liver health nutrition with focus on fatty liver disease and hepatic wellness.',
        whatsapp: '+919876543223',
        achievements: ['Liver Health Expert', 'NAFLD Specialist', 'Hepatic Nutrition Pioneer'],
        nextAvailable: 'Today 4:00 PM'
      },
      {
        id: 12,
        name: 'Dr. Deepika Murthy',
        specialization: 'Hepatic Nutrition Expert',
        experience: '11 years',
        rating: 4.8,
        reviews: 189,
        location: 'Saraswathipuram, Mysuru',
        languages: ['English', 'Kannada', 'Tamil'],
        expertise: ['Non-Alcoholic Fatty Liver', 'Liver Cleanse', 'Metabolic Liver Disease', 'Hepatitis Nutrition'],
        qualifications: ['MS in Hepatic Nutrition', 'Liver Disease Specialist'],
        consultationFee: '₹900',
        availability: 'Mon-Fri 10AM-6PM',
        image: '/api/placeholder/150/150',
        bio: 'Specialized in hepatic nutrition, focusing on fatty liver management and liver health optimization.',
        whatsapp: '+919876543230',
        achievements: ['Hepatic Health Expert', 'Fatty Liver Specialist', 'Liver Wellness Advocate'],
        nextAvailable: 'Tomorrow 11:00 AM'
      }
    ],
    6: [ // Cardiovascular Disease
      {
        id: 13,
        name: 'Dr. Aarti Sharma',
        specialization: 'Cardiovascular Nutrition Specialist',
        experience: '8 years',
        rating: 4.9,
        reviews: 156,
        location: 'Rajajinagar, Bengaluru',
        languages: ['English', 'Hindi', 'Kannada'],
        expertise: ['Heart Disease Prevention', 'Cardiac Diet', 'Hypertension Management', 'Stroke Prevention'],
        qualifications: ['PhD in Nutrition', 'Cardiovascular Nutrition Certified'],
        consultationFee: '₹1000',
        availability: 'Mon-Fri 9AM-6PM',
        image: '/api/placeholder/150/150',
        bio: 'Cardiovascular nutrition expert with focus on heart disease prevention and cardiac wellness.',
        whatsapp: '+919876543210',
        achievements: ['Heart Health Expert', 'Cardiac Prevention Specialist', 'Cardiovascular Research'],
        nextAvailable: 'Today 2:00 PM'
      },
      {
        id: 14,
        name: 'Dr. Latha Hegde',
        specialization: 'Heart Health Doctor',
        experience: '15 years',
        rating: 4.9,
        reviews: 201,
        location: 'Vidyanagar, Davangere',
        languages: ['English', 'Kannada'],
        expertise: ['Coronary Heart Disease', 'Heart Attack Recovery', 'Cardiac Rehabilitation', 'Arrhythmia Diet'],
        qualifications: ['MS in Cardiac Nutrition', 'Heart Disease Specialist'],
        consultationFee: '₹850',
        availability: 'Mon-Sat 9AM-6PM',
        image: '/api/placeholder/150/150',
        bio: 'Experienced cardiac doctor specializing in heart disease management and cardiovascular wellness.',
        whatsapp: '+919876543229',
        achievements: ['Cardiac Care Expert', 'Heart Health Specialist', 'Cardiovascular Research'],
        nextAvailable: 'Today 2:00 PM'
      },
      {
        id: 15,
        name: 'Dr. Prakash Hugar',
        specialization: 'Cardiac Rehabilitation Specialist',
        experience: '17 years',
        rating: 4.7,
        reviews: 234,
        location: 'Unkal, Hubli',
        languages: ['English', 'Kannada', 'Hindi'],
        expertise: ['Post-Cardiac Surgery', 'Heart Failure Management', 'Cardiac Diet Planning', 'Exercise Nutrition'],
        qualifications: ['MD Cardiology', 'Cardiac Rehabilitation Certified'],
        consultationFee: '₹900',
        availability: 'Mon-Sat 8AM-6PM',
        image: '/api/placeholder/150/150',
        bio: 'Senior cardiac rehabilitation specialist with expertise in post-surgery nutrition and heart failure management.',
        whatsapp: '+919876543235',
        achievements: ['Cardiac Rehabilitation Expert', 'Heart Surgery Support', 'Cardiac Recovery Pioneer'],
        nextAvailable: 'Tomorrow 9:00 AM'
      }
    ]
  };

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM'
  ];

  const handleConditionSelect = (condition) => {
    setSelectedCondition(condition);
    setCurrentView('doctors');
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentView('doctorDetails');
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    setIsBooking(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingData = {
        doctor: selectedDoctor,
        condition: selectedCondition,
        date: selectedDate,
        time: selectedTime,
        mode: consultationMode,
        type: consultationMode === 'online' ? bookingType : 'in-person',
        notes: consultationNotes,
        userProfile: userProfile
      };
      
      console.log('Booking data:', bookingData);
      
      const modeText = consultationMode === 'online' ? 'online' : 'in-person';
      const typeText = consultationMode === 'online' ? ` (${bookingType})` : '';
      toast.success(`${modeText.charAt(0).toUpperCase() + modeText.slice(1)} appointment booked successfully${typeText}!`);
      setShowBookingModal(false);
      resetBookingForm();
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const resetBookingForm = () => {
    setSelectedDate(null);
    setSelectedTime('');
    setConsultationNotes('');
    setBookingType('consultation');
    setConsultationMode('online');
  };

  const handleWhatsAppContact = (doctor) => {
    const message = `Hi Dr. ${doctor.name}, I'm interested in a nutrition consultation. My name is ${userProfile?.name || 'User'}.`;
    const whatsappUrl = `https://wa.me/${doctor.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const goBack = () => {
    if (currentView === 'doctorDetails') {
      setCurrentView('doctors');
      setSelectedDoctor(null);
    } else if (currentView === 'doctors') {
      setCurrentView('conditions');
      setSelectedCondition(null);
    }
  };

  const getFilteredDoctors = () => {
    if (!selectedCondition) return [];
    
    const conditionDoctors = doctors[selectedCondition.id] || [];
    
    let filtered = conditionDoctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterBy === 'rating') {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    } else if (filterBy === 'fee') {
      filtered = filtered.sort((a, b) => 
        parseInt(a.consultationFee.replace(/[^\d]/g, '')) - parseInt(b.consultationFee.replace(/[^\d]/g, ''))
      );
    } else if (filterBy === 'experience') {
      filtered = filtered.sort((a, b) => 
        parseInt(b.experience.replace(/[^\d]/g, '')) - parseInt(a.experience.replace(/[^\d]/g, ''))
      );
    }

    return filtered;
  };

  // Health Condition Cards Component
  const ConditionCard = ({ condition }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-blue-100"
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => handleConditionSelect(condition)}
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${condition.color} rounded-full flex items-center justify-center mb-4`}>
        <condition.icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-bold text-blue-900 mb-2">{condition.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{condition.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-600 font-medium">{condition.doctorCount} Doctors</span>
        <motion.button
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Doctors
        </motion.button>
      </div>
    </motion.div>
  );

  // Doctor Cards Component
  const DoctorCard = ({ doctor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 h-full flex flex-col"
      whileHover={{ y: -5 }}
    >
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-blue-900 mb-1">{doctor.name}</h3>
          <p className="text-blue-600 font-medium mb-2">{doctor.specialization}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{doctor.rating}</span>
              <span>({doctor.reviews} reviews)</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{doctor.experience}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex-grow">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">{doctor.location}</span>
        </div>
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">Next: {doctor.nextAvailable}</span>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-blue-900 mb-2">Expertise</h4>
          <div className="flex flex-wrap gap-2">
            {doctor.expertise.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                {skill}
              </span>
            ))}
            {doctor.expertise.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">
                +{doctor.expertise.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-blue-900">
            {doctor.consultationFee}
            <span className="text-sm font-normal text-gray-600"> / session</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
        <motion.button
          onClick={() => handleDoctorSelect(doctor)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <User className="w-4 h-4" />
          <span>View Details</span>
        </motion.button>

        <motion.button
          onClick={() => {
            setSelectedDoctor(doctor);
            setShowBookingModal(true);
          }}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Calendar className="w-4 h-4" />
          <span>Book Now</span>
        </motion.button>
      </div>
    </motion.div>
  );

  // Doctor Details Component
  const DoctorDetails = ({ doctor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8"
    >
      <div className="flex items-start space-x-6 mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-sage to-light-green rounded-full flex items-center justify-center">
          <User className="w-12 h-12 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{doctor.name}</h2>
          <p className="text-sage font-medium text-lg mb-3">{doctor.specialization}</p>
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-medium">{doctor.rating}</span>
              <span>({doctor.reviews} reviews)</span>
            </div>
            <div className="flex items-center space-x-1">
              <GraduationCap className="w-5 h-5" />
              <span>{doctor.experience}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">{doctor.consultationFee}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">{doctor.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">{doctor.availability}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">About</h3>
          <p className="text-gray-600 mb-6">{doctor.bio}</p>
          
          <h4 className="font-medium text-gray-800 mb-3">Languages</h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {doctor.languages.map((lang, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {lang}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3">Qualifications</h4>
          <div className="space-y-2 mb-6">
            {doctor.qualifications.map((qualification, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">{qualification}</span>
              </div>
            ))}
          </div>

          <h4 className="font-medium text-gray-800 mb-3">Achievements</h4>
          <div className="space-y-2">
            {doctor.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-medium text-gray-800 mb-3">Areas of Expertise</h4>
        <div className="flex flex-wrap gap-3">
          {doctor.expertise.map((skill, index) => (
            <span key={index} className="px-4 py-2 bg-sage/10 text-sage text-sm rounded-full font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <AnimatedButton
          onClick={() => setShowBookingModal(true)}
          variant="primary"
          icon={Calendar}
          className="flex-1"
        >
          Book Appointment
        </AnimatedButton>

        <AnimatedButton
          onClick={() => handleWhatsAppContact(doctor)}
          variant="success"
          icon={MessageCircle}
          className="flex-1"
        >
          WhatsApp Consultation
        </AnimatedButton>
      </div>
    </motion.div>
  );

  // Booking Modal Component
  const BookingModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 booking-modal-overlay"
      onClick={() => setShowBookingModal(false)}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto booking-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
          <button
            onClick={() => setShowBookingModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {selectedDoctor && (
          <div className="flex items-center space-x-4 mb-6 p-4 bg-sage/10 rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-sage to-light-green rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{selectedDoctor.name}</h3>
              <p className="text-sm text-sage">{selectedDoctor.specialization}</p>
              <p className="text-sm text-gray-600">{selectedDoctor.location}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={new Date()}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent text-gray-800"
              placeholderText="Choose a date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <motion.button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    selectedTime === time
                      ? 'border-sage bg-sage text-black'
                      : 'border-gray-300 hover:border-sage text-gray-700 hover:text-gray-800'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {time}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultation Mode
            </label>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { value: 'online', label: 'Online Consultation', icon: Video, description: 'Video/Phone call from home' },
                { value: 'offline', label: 'In-Person Visit', icon: MapPin, description: 'Visit doctor\'s clinic' }
              ].map((mode) => (
                <motion.button
                  key={mode.value}
                  onClick={() => setConsultationMode(mode.value)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                    consultationMode === mode.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300 text-gray-700 hover:text-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <mode.icon className="w-6 h-6" />
                    <div className="font-medium">{mode.label}</div>
                  </div>
                  <div className="text-sm text-gray-600">{mode.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {consultationMode === 'online' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Online Consultation Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'consultation', label: 'Video Call', icon: Video },
                  { value: 'call', label: 'Phone Call', icon: Phone },
                  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }
                ].map((type) => (
                  <motion.button
                    key={type.value}
                    onClick={() => setBookingType(type.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      bookingType === type.value
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 hover:border-blue-300 text-gray-700 hover:text-gray-800'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <type.icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">{type.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {consultationMode === 'offline' && (
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Clinic Address</h4>
                  <p className="text-sm text-blue-700">{selectedDoctor?.location}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Please arrive 10 minutes before your appointment time.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent text-gray-800 placeholder-gray-500"
              rows="4"
              placeholder="Any specific concerns or questions you'd like to discuss..."
            />
          </div>

          <div className="flex space-x-4">
            <motion.button
              onClick={handleBookAppointment}
              disabled={isBooking}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl font-medium ${
                isBooking
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sage to-light-green text-white hover:shadow-lg'
              }`}
              whileHover={{ scale: isBooking ? 1 : 1.02 }}
              whileTap={{ scale: isBooking ? 1 : 0.98 }}
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  <span>Confirm Booking</span>
                </>
              )}
            </motion.button>

            <motion.button
              onClick={() => setShowBookingModal(false)}
              className="px-6 py-4 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            {currentView !== 'conditions' && (
              <motion.button
                onClick={goBack}
                className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="w-6 h-6 text-blue-600" />
              </motion.button>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
                {currentView === 'conditions' && 'Get Expert Help for These Conditions'}
                {currentView === 'doctors' && `${selectedCondition?.name} Specialists`}
                {currentView === 'doctorDetails' && 'Doctor Profile'}
              </h1>
              <p className="text-blue-700">
                {currentView === 'conditions' && 'Choose your health condition to find specialized doctors'}
                {currentView === 'doctors' && `Expert doctors specializing in ${selectedCondition?.name.toLowerCase()} management`}
                {currentView === 'doctorDetails' && 'Complete profile and booking information'}
              </p>
            </div>
          </div>

          {/* Search and Filter for Doctors View */}
          {currentView === 'doctors' && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors by name or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-800"
                >
                  <option value="all">Sort by</option>
                  <option value="rating">Highest Rating</option>
                  <option value="fee">Lowest Fee</option>
                  <option value="experience">Most Experience</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>

        {/* Content based on current view */}
        {currentView === 'conditions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthConditions.map((condition, index) => (
              <motion.div
                key={condition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ConditionCard condition={condition} />
              </motion.div>
            ))}
          </div>
        )}

        {currentView === 'doctors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredDoctors().length > 0 ? (
              getFilteredDoctors().map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <DoctorCard doctor={doctor} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-blue-800 mb-2">No doctors found</h3>
                <p className="text-blue-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'doctorDetails' && selectedDoctor && (
          <DoctorDetails doctor={selectedDoctor} />
        )}

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingModal && <BookingModal />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Doctors;