'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [ordersCreated, setOrdersCreated] = useState<any[]>([]);

  useEffect(() => {
    if (reference) {
      verifyPayment();
    }
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/paystack/verify?reference=${reference}`);
      const result = await response.json();

      if (result.success) {
        setPaymentStatus('success');
        setTransactionData(result.data);
        
        // Store orders if created
        if (result.orders) {
          setOrdersCreated(result.orders);
          console.log(`✅ ${result.orders.length} order(s) created successfully`);
        }
        
        // Clear cart from localStorage after successful payment
        localStorage.removeItem('cart');
        
        console.log('✅ Payment verified and cart cleared');
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
    }
  };

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {paymentStatus === 'success' ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully.
            </p>
            
            {ordersCreated.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-green-800">
                  ✅ {ordersCreated.length} order{ordersCreated.length > 1 ? 's' : ''} created successfully!
                </p>
              </div>
            )}

            {transactionData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono text-gray-900">{transactionData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-brand-primary">₦{transactionData.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">{transactionData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Channel:</span>
                    <span className="text-gray-900">{transactionData.channel}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {ordersCreated.length > 0 && (
                <Link
                  href="/dashboard/student/orders"
                  className="w-full inline-block text-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors text-base font-medium"
                >
                  View My Orders
                </Link>
              )}
              <Link
                href="/dashboard/student"
                className="w-full inline-block text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-base font-medium"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="w-full inline-block text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. Please contact support if you believe this is an error.
            </p>

            <div className="space-y-3">
              <Link
                href="/"
                className="w-full btn-primary py-3 text-base font-medium"
              >
                Try Again
              </Link>
              <Link
                href="/support"
                className="w-full btn-secondary py-3 text-base font-medium"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
