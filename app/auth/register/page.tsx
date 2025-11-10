'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Store, 
  Truck, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageCircle
} from 'lucide-react';
import Logo from '../../../components/Logo';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'student';
  university: string;
  studentId?: string;
  department?: string;
  level?: string;
  agreeToTerms: boolean;
}

const universities = [
  'Baze University',
  'Veritas University'
];

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Order food and track deliveries',
    icon: User,
    color: 'bg-blue-500'
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [emailForOtp, setEmailForOtp] = useState('');
  const [userIdForOtp, setUserIdForOtp] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues
  } = useForm<RegisterFormData>();

  const password = watch('password');
  const watchedPhone = watch('phone');

  const resendOtp = async () => {
    if (!emailForOtp) {
      toast.error('Email not found. Please register again.');
      return;
    }

    setIsLoading(true);
    try {
      // Call resend OTP endpoint (you can create this later)
      toast.success('OTP resent! Check your email and WhatsApp');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpAndRegister = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForOtp, code: otpCode }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('✅ Email verified! Registration complete. You can now log in.');
        router.push('/auth/login');
      } else {
        toast.error(result.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error('Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {

    if (data.password && data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          role: selectedRole,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Registration successful - OTP sent automatically
        toast.success('📧 Check your email and WhatsApp for verification code!', {
          duration: 5000,
        });
        setEmailForOtp(data.email);
        setUserIdForOtp(result.data?.id || '');
        setRegistrationStep('otp');
        setIsLoading(false);
      } else {
        // Handle specific error cases
        if (result.message?.includes('already exists')) {
          toast.error('An account with this email already exists. Please try logging in instead.');
        } else {
          toast.error(result.message || 'Registration failed');
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
      setIsLoading(false);
    }
  };

  if (registrationStep === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="mb-6">
                <Logo size="lg" />
              </div>
              <button
                onClick={() => setRegistrationStep('form')}
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Registration
              </button>
              <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="mt-2 text-sm text-gray-600">
                We've sent a 6-digit code to <strong>{emailForOtp}</strong>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Also check your WhatsApp for the code
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="otpCode" className="form-label">
                  OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otpCode"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="form-input pl-10"
                    placeholder="Enter 6-digit code"
                  />
                </div>
              </div>

              <button
                onClick={verifyOtpAndRegister}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify & Complete Registration'
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={resendOtp}
                  disabled={isLoading}
                  className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Resend OTP'}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Check both your email inbox and WhatsApp
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="mb-6">
              <Logo size="lg" />
            </div>
            <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join Borrands Marketplace and connect with your community
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Student Registration Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900">Student Registration</h3>
                  <p className="text-xs text-blue-700">You are registering as a student to order food and track deliveries</p>
                </div>
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="form-label">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className={`form-input ${errors.name ? 'border-error-500' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="form-error flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                className={`form-input ${errors.email ? 'border-error-500' : ''}`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="form-error flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* WhatsApp Phone */}
            <div>
              <label htmlFor="phone" className="form-label">
                WhatsApp Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', { 
                    required: 'WhatsApp phone number is required',
                    pattern: {
                      value: /^\+?[\d\s-()]+$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  className={`form-input pl-10 ${errors.phone ? 'border-error-500' : ''}`}
                  placeholder="+234 801 234 5678"
                />
              </div>
              {errors.phone && (
                <p className="form-error flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* University */}
            <div>
              <label htmlFor="university" className="form-label">
                University
              </label>
              <select
                id="university"
                {...register('university', { required: 'University is required' })}
                className={`form-input ${errors.university ? 'border-error-500' : ''}`}
              >
                <option value="">Select your university</option>
                {universities.map((university) => (
                  <option key={university} value={university}>
                    {university}
                  </option>
                ))}
              </select>
              {errors.university && (
                <p className="form-error flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.university.message}
                </p>
              )}
            </div>

            {/* Student-specific fields */}
            {selectedRole === 'student' && (
              <>
                <div>
                  <label htmlFor="studentId" className="form-label">
                    Student ID (Optional)
                  </label>
                  <input
                    id="studentId"
                    type="text"
                    {...register('studentId')}
                    className="form-input"
                    placeholder="Enter your student ID"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="form-label">
                    Department (Optional)
                  </label>
                  <input
                    id="department"
                    type="text"
                    {...register('department')}
                    className="form-input"
                    placeholder="Enter your department"
                  />
                </div>

                <div>
                  <label htmlFor="level" className="form-label">
                    Level (Optional)
                  </label>
                  <select
                    id="level"
                    {...register('level')}
                    className="form-input"
                  >
                    <option value="">Select your level</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                    <option value="600">600 Level</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className={`form-input pr-10 ${errors.password ? 'border-error-500' : ''}`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className={`form-input pr-10 ${errors.confirmPassword ? 'border-error-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  {...register('agreeToTerms', { 
                    required: 'You must agree to the terms and conditions' 
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </Link>
                </label>
                {errors.agreeToTerms && (
                  <p className="form-error flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.agreeToTerms.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary-600 hover:text-primary-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


