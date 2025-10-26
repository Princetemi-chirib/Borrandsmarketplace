'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft,
  AlertCircle,
  Phone,
  Lock,
  MessageCircle
} from 'lucide-react';
import Logo from '../../../components/Logo';

interface LoginFormData {
  phone: string;
  password?: string;
  otpCode?: string;
  rememberMe: boolean;
}

type LoginMethod = 'password' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneForOtp, setPhoneForOtp] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>();

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
        body: JSON.stringify({ phone, purpose: 'login' }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('OTP sent via WhatsApp!');
        setOtpSent(true);
        setPhoneForOtp(phone);
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      let response;
      
      if (loginMethod === 'otp') {
        response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: data.phone, code: data.otpCode }),
        });
      } else {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: data.phone, password: data.password }),
        });
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Login successful!');
        
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        const user = result.data.user;
        if (user.role === 'student') {
          router.push('/dashboard/student');
        } else if (user.role === 'restaurant') {
          router.push('/dashboard/restaurant');
        } else if (user.role === 'rider') {
          router.push('/dashboard/rider');
        } else if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        console.error('Login failed:', result);
        if (result.requiresVerification) {
          toast.error('Please verify your phone number first. Try using OTP login.');
        } else if (result.message.includes('Invalid phone or password')) {
          toast.error('Invalid phone number or password. Please check your credentials.');
        } else {
          toast.error(result.message || 'Login failed');
        }
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your Borrands Marketplace account
            </p>
            
            {/* Development Test Credentials */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-800 mb-1">Test Credentials:</p>
                <p className="text-xs text-blue-700">Phone: +2347055699437</p>
                <p className="text-xs text-blue-700">Use OTP Login (existing user)</p>
                <button
                  type="button"
                  onClick={() => {
                    setValue('phone', '+2347055699437');
                    setLoginMethod('otp');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                >
                  Fill Test Phone (Use OTP)
                </button>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800 font-medium">Quick Access:</p>
                  <button
                    type="button"
                    onClick={() => {
                      // Simulate successful login for development
                      const testUser = {
                        _id: '507f1f77bcf86cd799439011',
                        name: 'Test Restaurant',
                        phone: '+2347055699437',
                        role: 'restaurant',
                        university: 'University of Lagos',
                        isVerified: true,
                        isActive: true,
                        createdAt: new Date().toISOString()
                      };
                      
                      localStorage.setItem('user', JSON.stringify(testUser));
                      localStorage.setItem('token', 'dev-test-token');
                      toast.success('Development login successful!');
                      router.push('/dashboard/restaurant');
                    }}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 mt-1"
                  >
                    🚀 Skip Login (Dev Only)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Login Method Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setOtpSent(false);
                setValue('otpCode', '');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'password'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock className="h-4 w-4 inline mr-2" />
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setOtpSent(false);
                setValue('password', '');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'otp'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              OTP
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-base ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your phone number (e.g., +2348999888777)"
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password Login */}
            {loginMethod === 'password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: loginMethod === 'password' ? 'Password is required' : false
                    })}
                    className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-base ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}

            {/* OTP Login */}
            {loginMethod === 'otp' && (
              <div>
                <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MessageCircle className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otpCode"
                      type="text"
                      maxLength={6}
                      {...register('otpCode', { 
                        required: loginMethod === 'otp' ? 'OTP code is required' : false,
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'Please enter a 6-digit code'
                        }
                      })}
                      className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-base text-center tracking-widest ${errors.otpCode ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      placeholder="000000"
                      autoComplete="one-time-code"
                    />
                  </div>
                  {errors.otpCode && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.otpCode.message}
                    </p>
                  )}
                  
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={() => sendOtp(watchedPhone)}
                      disabled={!watchedPhone || isLoading}
                      className="w-full btn-secondary py-2 text-sm disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Send OTP via WhatsApp'}
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        OTP sent to {phoneForOtp}
                      </p>
                      <button
                        type="button"
                        onClick={() => sendOtp(watchedPhone)}
                        disabled={isLoading}
                        className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                      >
                        {isLoading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
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
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary-600 hover:text-primary-500 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


