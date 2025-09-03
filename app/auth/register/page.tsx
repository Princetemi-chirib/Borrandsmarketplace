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
  phone: string;
  password?: string;
  confirmPassword?: string;
  role: 'student' | 'restaurant' | 'rider';
  university: string;
  studentId?: string;
  department?: string;
  level?: string;
  agreeToTerms: boolean;
}

const universities = [
  'University of Lagos',
  'University of Ibadan',
  'Covenant University',
  'University of Nigeria',
  'Obafemi Awolowo University',
  'University of Benin',
  'Ahmadu Bello University',
  'University of Port Harcourt',
  'Federal University of Technology, Akure',
  'University of Calabar',
  'Other'
];

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Order food and track deliveries',
    icon: User,
    color: 'bg-blue-500'
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    description: 'Manage orders and grow your business',
    icon: Store,
    color: 'bg-green-500'
  },
  {
    id: 'rider',
    title: 'Rider',
    description: 'Deliver orders and earn money',
    icon: Truck,
    color: 'bg-orange-500'
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [phoneForOtp, setPhoneForOtp] = useState('');

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

  const sendOtp = async (phone: string) => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'register' }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('OTP sent via WhatsApp!');
        setPhoneForOtp(phone);
        setRegistrationStep('otp');
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send OTP');
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
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneForOtp, code: otpCode }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Registration successful! You can now log in.');
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
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

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
        // Send OTP for verification
        await sendOtp(data.phone);
      } else {
        // Handle specific error cases
        if (result.message?.includes('already exists')) {
          toast.error('An account with this phone number already exists. Please try logging in instead.');
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
              <h2 className="text-3xl font-bold text-gray-900">Verify Your Phone</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter the 6-digit code sent to {phoneForOtp}
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
                  onClick={() => sendOtp(phoneForOtp)}
                  disabled={isLoading}
                  className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Resend OTP'}
                </button>
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
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      selectedRole === role.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center mr-3`}>
                        <role.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{role.title}</h3>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                      {selectedRole === role.id && (
                        <CheckCircle className="h-5 w-5 text-primary-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[\d\s-()]+$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  className={`form-input pl-10 ${errors.phone ? 'border-error-500' : ''}`}
                  placeholder="Enter your phone number"
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

            {/* Password (Optional) */}
            <div>
              <label htmlFor="password" className="form-label">
                Password (Optional)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className={`form-input pr-10 ${errors.password ? 'border-error-500' : ''}`}
                  placeholder="Create a password (optional)"
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

            {/* Confirm Password (if password provided) */}
            {password && (
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', { 
                      validate: value => !password || value === password || 'Passwords do not match'
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
            )}

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


