'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  Phone, 
  MessageCircle,
  Star,
  RefreshCw,
  Package,
  Calendar,
  MapPin,
  User,
  Eye,
  Check,
  X
} from 'lucide-react';

export default function RestaurantOrders() {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const statuses = ['All', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
  
  const orders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      customerPhone: '+234 801 234 5678',
      items: [
        { name: 'Jollof Rice with Chicken', quantity: 1, price: '₦1,200' },
        { name: 'Plantain', quantity: 2, price: '₦300' }
      ],
      total: '₦1,800',
      status: 'preparing',
      orderTime: '14:30',
      estimatedDelivery: '15:00',
      deliveryAddress: 'Block A, Room 205, University Campus',
      specialInstructions: 'Extra spicy please',
      paymentMethod: 'Card',
      orderNumber: 'ORD-001'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      customerPhone: '+234 802 345 6789',
      items: [
        { name: 'Margherita Pizza (Large)', quantity: 1, price: '₦2,500' },
        { name: 'Coca Cola', quantity: 1, price: '₦200' }
      ],
      total: '₦2,700',
      status: 'pending',
      orderTime: '14:45',
      estimatedDelivery: '15:15',
      deliveryAddress: 'Block B, Room 312, University Campus',
      specialInstructions: '',
      paymentMethod: 'Mobile Money',
      orderNumber: 'ORD-002'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      customerPhone: '+234 803 456 7890',
      items: [
        { name: 'Classic Burger', quantity: 2, price: '₦1,800' },
        { name: 'French Fries', quantity: 1, price: '₦500' }
      ],
      total: '₦4,100',
      status: 'ready',
      orderTime: '14:15',
      estimatedDelivery: '14:45',
      deliveryAddress: 'Block C, Room 108, University Campus',
      specialInstructions: 'No onions',
      paymentMethod: 'Card',
      orderNumber: 'ORD-003'
    },
    {
      id: 'ORD-004',
      customer: 'Sarah Wilson',
      customerPhone: '+234 804 567 8901',
      items: [
        { name: 'Chocolate Cake Slice', quantity: 1, price: '₦800' },
        { name: 'Cappuccino', quantity: 1, price: '₦400' }
      ],
      total: '₦1,200',
      status: 'delivered',
      orderTime: '13:30',
      estimatedDelivery: '14:00',
      deliveryAddress: 'Library, Ground Floor, University Campus',
      specialInstructions: '',
      paymentMethod: 'Card',
      orderNumber: 'ORD-004',
      rating: 5,
      review: 'Great food, fast delivery!'
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus.toLowerCase();
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'pending':
        return { action: 'Confirm Order', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'confirmed':
        return { action: 'Start Preparing', color: 'bg-orange-600 hover:bg-orange-700' };
      case 'preparing':
        return { action: 'Mark Ready', color: 'bg-green-600 hover:bg-green-700' };
      case 'ready':
        return { action: 'Assign Rider', color: 'bg-purple-600 hover:bg-purple-700' };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-1">Manage incoming orders and track delivery status</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent w-64"
              />
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">Placed at {order.orderTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{order.total}</div>
                    <div className="text-sm text-gray-600">Est. delivery: {order.estimatedDelivery}</div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6">
                {/* Customer Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{order.customerPhone}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">×{item.quantity}</span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-gray-900 font-medium">{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Special Instructions:</strong> {order.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Delivery Address */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                </div>

                {/* Review (for delivered orders) */}
                {order.status === 'delivered' && order.rating && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{order.rating}/5 stars</span>
                    </div>
                    <p className="text-sm text-gray-600">{order.review}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">View Details</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageCircle className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Message Customer</span>
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    {getNextAction(order.status) && (
                      <button className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors ${getNextAction(order.status)!.color}`}>
                        <Check className="h-4 w-4" />
                        <span className="text-sm">{getNextAction(order.status)!.action}</span>
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <X className="h-4 w-4" />
                        <span className="text-sm">Reject Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">No orders match your current filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





