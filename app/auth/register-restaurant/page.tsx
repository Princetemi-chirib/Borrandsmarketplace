'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ChefHat, 
  MapPin, 
  Phone, 
  Clock, 
  DollarSign, 
  User,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Logo from '@/components/Logo';

interface RestaurantFormData {
  // Restaurant Information
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  
  // Business Details
  minimumOrder: number;
  estimatedDeliveryTime: number;
  university: string;
  openingTime: string;
  closingTime: string;
  
  // Owner Information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword: string;
  confirmPassword: string;
}

const cuisineOptions = [
  'Nigerian', 'Italian', 'Chinese', 'Indian', 'Mexican', 'American', 
  'Mediterranean', 'Thai', 'Japanese', 'Korean', 'African', 'Caribbean',
  'Middle Eastern', 'European', 'Fusion', 'Fast Food', 'Healthy', 'Desserts'
];

const universityOptions = [
  'Baze University',
  'Veritas University'
];

export default function RestaurantRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    description: '',
    cuisine: '',
    address: '',
    phone: '',
    minimumOrder: 0,
    estimatedDeliveryTime: 30,
    university: '',
    openingTime: '08:00',
    closingTime: '22:00',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: keyof RestaurantFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.description || !formData.cuisine || !formData.address) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.phone || !formData.university) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!formData.openingTime || !formData.closingTime) {
          setError('Please select both opening and closing time');
          return false;
        }
        // Simple time validation: closing must be after opening
        if (formData.openingTime >= formData.closingTime) {
          setError('Closing time must be later than opening time');
          return false;
        }
        break;
      case 3:
        if (!formData.ownerName || !formData.ownerEmail || !formData.ownerPhone || !formData.ownerPassword) {
          setError('Please fill in all required fields');
          return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.ownerEmail)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (formData.ownerPassword !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.ownerPassword.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Submitting restaurant application...');
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      const data = await response.json();
      console.log('📡 Restaurant API response:', data);

      if (response.ok) {
        setSuccess('Restaurant application submitted! Please verify your email to complete registration.');
        setShowVerification(true);
        
        console.log('⏰ Auto-sending OTP in 1 second...');
        // Auto-send OTP after successful restaurant creation
        setTimeout(() => {
          console.log('📧 Calling handleSendOTP...');
          handleSendOTP();
        }, 1000);
      } else {
        setError(data.error || 'Failed to register restaurant');
      }
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    try {
      console.log('📧 handleSendOTP called with email:', formData.ownerEmail);
      setOtpSending(true);
      setError('');
      
      const response = await fetch('/api/auth/restaurant-email-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.ownerEmail
        }),
      });

      const data = await response.json();
      console.log('📡 Email OTP API response:', data);

      if (response.ok) {
        // For development: if OTP is returned in response, auto-fill it
        if (data.otp) {
          console.log('🔑 Development OTP received:', data.otp);
          setOtp(data.otp);
          setSuccess('OTP sent successfully! (Development mode - OTP auto-filled)');
        } else {
          setSuccess('OTP sent successfully! Check your email for the verification code.');
        }
        setOtpSent(true);
        setError('');
        console.log('✅ OTP sent successfully, otpSent set to true');
      } else {
        setError(data.error || 'Failed to send OTP');
        console.log('❌ OTP sending failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Error in handleSendOTP:', error);
      setError('Network error. Please try again.');
    } finally {
      setOtpSending(false);
      console.log('🔄 OTP sending completed, otpSending set to false');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP code');
      return;
    }

    console.log('🔍 Starting OTP verification...');
    console.log('📧 Email being verified:', formData.ownerEmail);
    console.log('🔑 OTP being verified:', otp);
    
    setVerificationLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/restaurant-email-verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.ownerEmail,
          otp: otp
        }),
      });

      const data = await response.json();
      console.log('📡 Verification API response:', data);

      if (response.ok) {
        setSuccess('Email verified successfully! Your restaurant application is now complete.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.error || data.message || 'Failed to verify OTP');
        console.log('❌ Verification failed:', data.error || data.message);
      }
    } catch (error) {
      console.error('❌ Error in handleVerifyOTP:', error);
      setError('Network error. Please try again.');
    } finally {
      setVerificationLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Restaurant Details', icon: Building2 },
    { number: 2, title: 'Business Info', icon: ChefHat },
    { number: 3, title: 'Owner Account', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-3 md:mb-4 text-sm md:text-base">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Logo />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-3 md:mt-4 px-4">Restaurant Registration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base px-4">Join our platform and start serving delicious food to students</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-6 md:mb-8 px-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'border-red-500 bg-red-500 text-white dark:border-red-600 dark:bg-red-600' 
                    : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 md:mx-4 ${
                    currentStep > step.number ? 'bg-red-500 dark:bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 md:mt-4">
            {steps.map((step) => (
              <span
                key={step.number}
                className={`text-xs md:text-sm font-medium text-center flex-1 px-1 ${
                  currentStep >= step.number ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-8"
          >
            {/* Step 1: Restaurant Details */}
            {currentStep === 1 && (
              <div className="space-y-4 md:space-y-6">
                <div className="text-center mb-4 md:mb-6">
                  <Building2 className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-3 md:mb-4" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Restaurant Information</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Tell us about your restaurant</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base"
                      placeholder="e.g., Pizza Palace, Campus Delight"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base resize-none"
                      placeholder="Describe your restaurant, specialties, and what makes you unique..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cuisine Type *
                    </label>
                    <select
                      value={formData.cuisine}
                      onChange={(e) => handleInputChange('cuisine', e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 text-sm md:text-base"
                    >
                      <option value="">Select cuisine type</option>
                      {cuisineOptions.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base"
                      placeholder="e.g., University Mall, Block A, Floor 2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-6">
                <div className="text-center mb-4 md:mb-6">
                  <ChefHat className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-3 md:mb-4" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Business Details</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Configure your delivery settings and opening hours</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm md:text-base"
                        placeholder="+234 801 234 5678"
                      />
                    </div>
                  </div>


            

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      University *
                    </label>
                    <select
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 text-sm md:text-base"
                    >
                      <option value="">Select university</option>
                      {universityOptions.map((university) => (
                        <option key={university} value={university}>{university}</option>
                      ))}
                    </select>
                  </div>

                 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Order (₦)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                      <input
                        type="number"
                        value={formData.minimumOrder}
                        onChange={(e) => handleInputChange('minimumOrder', parseInt(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm md:text-base"
                        placeholder="2000"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Delivery Time (minutes)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                      <input
                        type="number"
                        value={formData.estimatedDeliveryTime}
                        onChange={(e) => handleInputChange('estimatedDeliveryTime', parseInt(e.target.value) || 30)}
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm md:text-base"
                        placeholder="30"
                        min="15"
                        max="120"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Opening Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                      <input
                        type="time"
                        value={formData.openingTime}
                        onChange={(e) => handleInputChange('openingTime', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Closing Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                      <input
                        type="time"
                        value={formData.closingTime}
                        onChange={(e) => handleInputChange('closingTime', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 text-sm md:text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Owner Account */}
            {currentStep === 3 && (
              <div className="space-y-4 md:space-y-6">
                <div className="text-center mb-4 md:mb-6">
                  <User className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-3 md:mb-4" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Owner Account</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Create your login credentials</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base"
                      placeholder="John Doe"
                    />
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base"
                      placeholder="owner@restaurant.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.ownerPhone}
                      onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base"
                      placeholder="+234 801 234 5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.ownerPassword}
                        onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
                        className="w-full px-4 py-2.5 md:py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm md:text-base"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-2.5 md:py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm md:text-base"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Important Information:</p>
                      <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                        <li>• Your restaurant will be reviewed by our admin team</li>
                        <li>• You'll receive an email notification once approved</li>
                        <li>• You can start adding menu items after approval</li>
                        <li>• Keep your login credentials safe</li>
                        <li>• Email verification is required to complete registration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error and Success Messages */}
            {error && (
              <div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-800 dark:text-red-200 text-sm md:text-base break-words">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-green-800 dark:text-green-200 text-sm md:text-base break-words">{success}</span>
              </div>
            )}

            {/* Email Verification Section */}
            {showVerification && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 md:p-6">
                <div className="text-center mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">Verify Your Email Address</h3>
                  <p className="text-blue-700 dark:text-blue-300 text-xs md:text-sm px-2">
                    {otpSent 
                      ? `We've sent a verification code to ${formData.ownerEmail}. Please enter it below to complete your registration.`
                      : `Sending verification code to ${formData.ownerEmail}... Please wait.`
                    }
                  </p>
                  {/* Development note */}
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                    💡 Development mode: OTP will be auto-filled for testing purposes
                  </p>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="flex-1 px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-center text-base md:text-lg font-mono text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                      maxLength={6}
                      disabled={!otpSent}
                    />
                    <button
                      onClick={handleSendOTP}
                      disabled={otpSending || !otpSent}
                      className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {otpSending ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleVerifyOTP}
                      disabled={verificationLoading || !otp || !otpSent}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {verificationLoading ? 'Verifying...' : 'Verify & Complete'}
                    </button>
                    
                    <button
                      onClick={() => setShowVerification(false)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 md:mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm md:text-base font-medium"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base font-medium"
                >
                  {isLoading ? 'Creating Restaurant...' : 'Create Restaurant'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="text-center mt-6 md:mt-8 px-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium">
                Sign in here
              </Link>
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-2">
              Or{' '}
              <Link href="/auth/register" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                register as a student
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}