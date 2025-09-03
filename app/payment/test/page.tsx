'use client';

import { useState } from 'react';
import PaymentForm from '@/components/PaymentForm';

export default function PaymentTestPage() {
  const [email, setEmail] = useState('test@example.com');
  const [amount, setAmount] = useState(1000);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment System Test
          </h1>
          <p className="text-lg text-gray-600">
            Test your Paystack payment integration with this demo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter test email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Amount (₦)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="form-input"
                  placeholder="Enter test amount"
                  min="100"
                  step="100"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Test Card Details</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Card Number:</strong> 4084 0840 8408 4081</p>
                  <p><strong>Expiry:</strong> Any future date</p>
                  <p><strong>CVV:</strong> Any 3 digits</p>
                  <p><strong>PIN:</strong> Any 4 digits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <PaymentForm
              amount={amount}
              email={email}
              onSuccess={(data) => {
                console.log('Payment successful:', data);
              }}
              onError={(error) => {
                console.error('Payment failed:', error);
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. Local Testing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use test Paystack keys in .env.local</li>
                <li>• Use test card details above</li>
                <li>• Check console for API responses</li>
                <li>• Verify webhook handling</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. Production Testing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use live Paystack keys</li>
                <li>• Test with real cards (small amounts)</li>
                <li>• Verify webhook URLs in Paystack dashboard</li>
                <li>• Check transaction logs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
