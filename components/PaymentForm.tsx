'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface PaymentFormProps {
  amount: number;
  email: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function PaymentForm({ amount, email, onSuccess, onError }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Generate unique reference
      const reference = `BOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Initialize payment
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          reference,
          callback_url: `${window.location.origin}/payment/success?reference=${reference}`,
          metadata: {
            orderId: reference,
            userId: 'test-user',
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to Paystack payment page
        window.location.href = result.data.authorization_url;
      } else {
        throw new Error(result.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Payment failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Payment</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Amount to pay:</p>
        <p className="text-2xl font-bold text-brand-primary">₦{amount.toLocaleString()}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Email:</p>
        <p className="text-sm font-medium text-gray-900">{email}</p>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="spinner mr-2"></div>
            Processing...
          </div>
        ) : (
          'Pay Now'
        )}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        You will be redirected to Paystack to complete your payment securely
      </p>
    </div>
  );
}
