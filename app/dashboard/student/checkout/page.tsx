'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Truck, 
  CreditCard, 
  Banknote,
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

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    address: '',
    instructions: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
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
  }, [router]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    // Calculate delivery fee based on restaurant
    const uniqueRestaurants = Array.from(new Set(cart.map(item => item.restaurantId)));
    return uniqueRestaurants.length * 500; // ₦500 per restaurant
  };

  const getTotal = () => {
    return getCartTotal() + getDeliveryFee();
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
      // Group items by restaurant
      const ordersByRestaurant = cart.reduce((acc, item) => {
        if (!acc[item.restaurantId]) {
          acc[item.restaurantId] = {
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
            items: []
          };
        }
        acc[item.restaurantId].items.push({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });
        return acc;
      }, {} as Record<string, any>);

      // Create orders for each restaurant
      const orderPromises = Object.values(ordersByRestaurant).map(async (orderData: any) => {
        const response = await fetch('/api/students/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            restaurantId: orderData.restaurantId,
            items: orderData.items,
            deliveryAddress: deliveryAddress.address,
            deliveryInstructions: deliveryAddress.instructions,
            paymentMethod,
            estimatedDeliveryTime: 30 // Default 30 minutes
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create order');
        }

        return response.json();
      });

      const results = await Promise.all(orderPromises);
      
      // Clear cart
      localStorage.removeItem('cart');
      setCart([]);

      // Redirect to orders page
      router.push('/dashboard/student/orders');
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'cash')}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                  />
                  <div className="ml-3 flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Credit/Debit Card</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'cash')}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                  />
                                     <div className="ml-3 flex items-center">
                     <Banknote className="h-5 w-5 text-gray-400 mr-2" />
                     <span className="text-sm font-medium text-gray-900">Cash on Delivery</span>
                   </div>
                </label>
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
                    <span>Place Order</span>
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

