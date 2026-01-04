'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function RiderRegistration() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Rider Registration</h1>
          <p className="text-gray-600 mb-6">
            Rider registration is currently disabled. Riders are added manually by administrators.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            If you need to become a rider, please contact the administrator.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </Link>
            <Link
              href="/auth/login"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
