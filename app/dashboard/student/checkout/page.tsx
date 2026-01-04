'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Truck, 
  CreditCard, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CartItem {
  restaurantId: string;
  restaurantName: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface DeliveryAddress {
  address: string;
  instructions: string;
  phone: string;
}

interface PopularLocation {
  id: string;
  name: string;
  address: string;
  description: string | null;
  useCount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    address: '',
    instructions: '',
    phone: ''
  });
  const [popularLocations, setPopularLocations] = useState<PopularLocation[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user from localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setDeliveryAddress(prev => ({
          ...prev,
          phone: userObj.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      setCart(cartData);
    } else {
      // Redirect to restaurants if cart is empty
      router.push('/dashboard/student/restaurants');
    }

    // Fetch popular delivery locations
    fetchPopularLocations();
  }, [router]);

  const fetchPopularLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/delivery-locations?limit=10&minUseCount=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPopularLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Error fetching popular locations:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getServiceCharge = () => 150; // Fixed service charge
  const getDeliveryFee = () => 500; // Fixed delivery fee

  const getTotal = () => {
    return getCartTotal() + getServiceCharge() + getDeliveryFee();
  };

  const synthesizeEmailFromPhone = (phone: string) => {
    const digits = (phone || '').toString().replace(/\D/g, '');
    const localPart = digits.length > 2 ? digits : 'customer';
    return `${localPart}@borrands.com`;
  };

  const trackDeliveryLocation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !deliveryAddress.address) return;

      await fetch('/api/delivery-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: locationName || deliveryAddress.address.substring(0, 50),
          address: deliveryAddress.address,
          description: deliveryAddress.instructions || ''
        })
      });
    } catch (error) {
      console.error('Error tracking delivery location:', error);
      // Don't block checkout if this fails
    }
  };

  const initializeCardPayment = async () => {
    const phone = user?.phone || deliveryAddress.phone;
    if (!phone) {
      setError('Missing phone number. Please add your phone.');
      return;
    }

    const reference = `BOR_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const payload = {
      // Paystack requires email; synthesize a compliant email from phone
      email: synthesizeEmailFromPhone(phone),
      amount: getTotal(),
      reference,
      callback_url: `${window.location.origin}/payment/success?reference=${reference}`,
      metadata: {
        cart: JSON.stringify(cart),
        deliveryAddress: JSON.stringify(deliveryAddress),
        userId: user?._id || user?.id || '',
        role: 'student',
        paymentMethod: 'paystack',
        phone,
      },
    };

    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to initialize payment');
    }

    // Redirect to Paystack hosted page
    window.location.href = result.data.authorization_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveryAddress.address.trim()) {
      setError('Please enter your delivery address');
      return;
    }

    if (!deliveryAddress.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Track delivery location usage (async, don't wait for it)
      trackDeliveryLocation();

      // Only card payment (Paystack) is supported
      await initializeCardPayment();
      return; // Redirecting to Paystack payment page
    } catch (error: any) {
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some items to your cart before checkout.</p>
          <button
            onClick={() => router.push('/dashboard/student/restaurants')}
            className="btn-primary"
          >
            Browse Restaurants
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Arrow */}
        <div className="flex justify-start">
          <BackArrow href="/dashboard/student/restaurants" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-brand-primary" />
                Delivery Address
              </h2>
              
              <div className="space-y-4">
                {/* Popular Locations */}
                {popularLocations.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Popular Delivery Locations
                    </label>
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {popularLocations.slice(0, 5).map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => {
                            setDeliveryAddress(prev => ({ ...prev, address: location.address }));
                            setLocationName(location.name);
                          }}
                          className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand-primary transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{location.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{location.address}</p>
                            </div>
                            <span className="text-xs text-gray-400 ml-2">
                              {location.useCount} uses
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={deliveryAddress.address}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your full delivery address (e.g., Student Hall A, Room 101)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Your address will be saved and suggested to other students after 5 uses
                  </p>
                </div>

                <div>
                  <label className="block text.sm font-medium text-gray-700 mb-2">
                    Delivery Instructions
                  </label>
                  <textarea
                    value={deliveryAddress.instructions}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Any special instructions for delivery (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={deliveryAddress.phone}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+234 801 234 5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Paystack Checkout</span>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {Object.entries(cart.reduce((acc, item) => {
                  if (!acc[item.restaurantId]) {
                    acc[item.restaurantId] = {
                      restaurantName: item.restaurantName,
                      items: []
                    };
                  }
                  acc[item.restaurantId].items.push(item);
                  return acc;
                }, {} as Record<string, any>)).map(([restaurantId, restaurantData]: [string, any]) => (
                  <div key={restaurantId} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h3 className="font-medium text-gray-900 mb-3">{restaurantData.restaurantName}</h3>
                    <div className="space-y-2">
                      {restaurantData.items.map((item: CartItem) => (
                        <div key={item.itemId} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Charge</span>
                  <span className="font-medium">₦{getServiceCharge().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₦{getDeliveryFee().toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₦{getTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Paystack Checkout</span>
                  </>
                )}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Estimated delivery time: 30-45 minutes</p>
                <p className="mt-1">You'll receive updates via WhatsApp</p>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </DashboardLayout>
  );
}

