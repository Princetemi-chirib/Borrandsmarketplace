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
        break;
      case 3:
        if (!formData.ownerName || !formData.ownerEmail || !formData.ownerPhone || !formData.ownerPassword) {
          setError('Please fill in all required fields');
          return false;
        }
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
        if (data.otp) {
          console.log('🔑 Development OTP received:', data.otp);
          setOtp(data.otp);
          setSuccess('OTP sent! (Development mode - OTP auto-filled)');
        } else {
          setSuccess('OTP sent to ' + formData.ownerEmail + '. Check your email for the verification code.');
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
        setError(data.error || 'Failed to verify OTP');
        console.log('❌ Verification failed:', data.error);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            Back to Home
          </Link>
          <Logo />
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mt-3 sm:mt-4">Restaurant Registration</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Join our platform and start serving delicious food to students</p>
        </div>

        {/* Progress Steps - mobile friendly */}
        <div className="mb-4 sm:mb-8">
            <div className="flex items-center justify-between gap-1 sm:gap-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1 sm:flex-initial justify-center sm:justify-start">
                                 <div className={`flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 flex-shrink-0 ${
                   currentStep >= step.number 
                     ? 'border-red-500 bg-red-500 text-white' 
                     : 'border-gray-300 text-gray-400'
                 }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                  ) : (
                    <step.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 sm:mx-2 sm:w-24 ${currentStep > step.number ? 'bg-red-500' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 sm:mt-4 gap-1">
            {steps.map((step) => (
                               <span
                   key={step.number}
                   className={`text-xs sm:text-sm font-medium truncate max-w-[28%] sm:max-w-none ${currentStep >= step.number ? 'text-red-600' : 'text-gray-400'}`}
                 >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8"
          >
            {/* Step 1: Restaurant Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                                     <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Restaurant Information</h2>
                  <p className="text-gray-600">Tell us about your restaurant</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="e.g., Pizza Palace, Campus Delight"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Describe your restaurant, specialties, and what makes you unique..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuisine Type *
                    </label>
                    <select
                      value={formData.cuisine}
                      onChange={(e) => handleInputChange('cuisine', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select cuisine type</option>
                      {cuisineOptions.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="e.g., University Mall, Block A, Floor 2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Business Details</h2>
                  <p className="text-gray-600">Configure your delivery settings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="+234 801 234 5678"
                      />
                    </div>
                  </div>



                  

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University *
                    </label>
                    <select
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select university</option>
                      {universityOptions.map((university) => (
                        <option key={university} value={university}>{university}</option>
                      ))}
                    </select>
                  </div>

                  

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order (₦)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={formData.minimumOrder}
                        onChange={(e) => handleInputChange('minimumOrder', parseInt(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="2000"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Delivery Time (minutes)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={formData.estimatedDeliveryTime}
                        onChange={(e) => handleInputChange('estimatedDeliveryTime', parseInt(e.target.value) || 30)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="30"
                        min="15"
                        max="120"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Owner Account */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Owner Account</h2>
                  <p className="text-gray-600">Create your login credentials</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="owner@restaurant.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.ownerPhone}
                      onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="+234 801 234 5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.ownerPassword}
                        onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
                                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important Information:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Your restaurant will be reviewed by our admin team</li>
                        <li>• You'll receive a WhatsApp notification once approved</li>
                        <li>• You can start adding menu items after approval</li>
                        <li>• Keep your login credentials safe</li>
                        <li>• Phone verification is required to complete registration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error and Success Messages */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800">{success}</span>
              </div>
            )}

            {/* Email Verification Section */}
            {showVerification && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <div className="text-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">Verify Your Email</h3>
                  <p className="text-blue-700 text-sm">
                    {otpSent 
                      ? `We've sent a 6-digit code to ${formData.ownerEmail}. Enter it below to complete registration.`
                      : 'Sending verification code to your email... Please wait.'
                    }
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-blue-600 mt-2 italic">
                      💡 Development: OTP may be auto-filled if email is not configured
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="flex-1 min-w-0 px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono text-gray-900 placeholder-gray-400"
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
                  
                  <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <button
                      onClick={() => setShowVerification(false)}
                      className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyOTP}
                      disabled={verificationLoading || !otp || !otpSent}
                      className="w-full sm:flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {verificationLoading ? 'Verifying...' : 'Verify & Complete'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons - stack on mobile for easier tap */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 sm:mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Creating Restaurant...' : 'Create Restaurant'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8 px-2">
            <p className="text-gray-600 text-sm sm:text-base">
              Already have an account?{' '}
                             <Link href="/auth/login" className="text-red-600 hover:text-red-700 font-medium">
                 Sign in here
               </Link>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Or{' '}
                             <Link href="/auth/register" className="text-red-600 hover:text-red-700">
                 register as a student
               </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
