'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  Truck, 
  Search,
  Filter,
  ShoppingBag,
  Eye,
  Trash2,
  Plus,
  Minus,
  X
} from 'lucide-react';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  cuisine: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  isOpen: boolean;
  distance: number;
  address: string;
  featuredItems: Array<{
    name: string;
    price: number;
    image: string;
  }>;
}

interface CartItem {
  restaurantId: string;
  restaurantName: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Mock data for demonstration
  const mockFavorites: Restaurant[] = [
    {
      _id: '1',
      name: 'Pizza Palace',
      description: 'Authentic Italian pizza with fresh ingredients',
      image: '/images/pizza-palace.jpg',
      rating: 4.8,
      reviewCount: 156,
      cuisine: 'Italian',
      deliveryFee: 500,
      minimumOrder: 2000,
      estimatedDeliveryTime: 25,
      isOpen: true,
      distance: 1.2,
      address: 'University Mall, Block A',
      featuredItems: [
        { name: 'Margherita Pizza', price: 3500, image: '/images/margherita.jpg' },
        { name: 'Pepperoni Pizza', price: 4000, image: '/images/pepperoni.jpg' }
      ]
    },
    {
      _id: '2',
      name: 'Burger House',
      description: 'Juicy burgers and crispy fries',
      image: '/images/burger-house.jpg',
      rating: 4.6,
      reviewCount: 89,
      cuisine: 'American',
      deliveryFee: 300,
      minimumOrder: 1500,
      estimatedDeliveryTime: 20,
      isOpen: true,
      distance: 0.8,
      address: 'Food Court, Block B',
      featuredItems: [
        { name: 'Classic Burger', price: 2500, image: '/images/classic-burger.jpg' },
        { name: 'Chicken Burger', price: 2200, image: '/images/chicken-burger.jpg' }
      ]
    },
    {
      _id: '3',
      name: 'Sushi Express',
      description: 'Fresh sushi and Japanese cuisine',
      image: '/images/sushi-express.jpg',
      rating: 4.9,
      reviewCount: 234,
      cuisine: 'Japanese',
      deliveryFee: 600,
      minimumOrder: 3000,
      estimatedDeliveryTime: 30,
      isOpen: true,
      distance: 2.1,
      address: 'University Mall, Block C',
      featuredItems: [
        { name: 'California Roll', price: 3000, image: '/images/california-roll.jpg' },
        { name: 'Salmon Nigiri', price: 2500, image: '/images/salmon-nigiri.jpg' }
      ]
    }
  ];

  useEffect(() => {
    // Get user from localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Simulate API call
    setTimeout(() => {
      setFavorites(mockFavorites);
      setFilteredFavorites(mockFavorites);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter and sort favorites
    let filtered = favorites.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine === selectedCuisine;
      return matchesSearch && matchesCuisine;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return a.distance - b.distance;
        case 'deliveryTime':
          return a.estimatedDeliveryTime - b.estimatedDeliveryTime;
        default:
          return 0;
      }
    });

    setFilteredFavorites(filtered);
  }, [favorites, searchTerm, selectedCuisine, sortBy]);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const removeFromFavorites = async (restaurantId: string) => {
    try {
      // API call to remove from favorites
      const response = await fetch(`/api/students/favorites/${restaurantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setFavorites(favorites.filter(r => r._id !== restaurantId));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      // For demo, remove from local state
      setFavorites(favorites.filter(r => r._id !== restaurantId));
    }
  };

  const addToCart = (restaurantId: string, restaurantName: string, item: any) => {
    const existingItem = cart.find(cartItem => 
      cartItem.restaurantId === restaurantId && cartItem.itemId === item._id
    );

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.restaurantId === restaurantId && cartItem.itemId === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        restaurantId,
        restaurantName,
        itemId: item._id || Math.random().toString(),
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image
      }]);
    }
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.itemId !== itemId));
    } else {
      setCart(cart.map(item =>
        item.itemId === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const cuisines = ['all', ...Array.from(new Set(favorites.map(r => r.cuisine)))];

  if (isLoading) {
    return (
      <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
      <div className="space-y-6">
        {/* Back Arrow */}
        <div className="flex justify-start">
          <BackArrow href="/dashboard/student" />
        </div>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600">Your saved restaurants and quick access to order</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Cuisine Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine === 'all' ? 'All Cuisines' : cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="distance">Sort by Distance</option>
                <option value="deliveryTime">Sort by Delivery Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((restaurant, index) => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Restaurant Image */}
                <div className="relative h-48 bg-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => removeFromFavorites(restaurant._id)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-semibold text-white">{restaurant.name}</h3>
                    <p className="text-white/90 text-sm">{restaurant.cuisine}</p>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                      <span className="text-sm text-gray-500">({restaurant.reviewCount})</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      restaurant.isOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{restaurant.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {restaurant.distance}km
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {restaurant.estimatedDeliveryTime}min
                      </span>
                    </div>
                    <span>₦{restaurant.deliveryFee}</span>
                  </div>

                  {/* Featured Items */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Featured Items</h4>
                    {restaurant.featuredItems.slice(0, 2).map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">₦{item.price}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(restaurant._id, restaurant.name, item)}
                          className="p-1 bg-brand-primary text-white rounded hover:bg-brand-accent transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/student/restaurants/${restaurant._id}`}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Menu
                    </Link>
                    <button
                      onClick={() => addToCart(restaurant._id, restaurant.name, restaurant.featuredItems[0])}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCuisine !== 'all' ? 'No favorites found' : 'No favorites yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || selectedCuisine !== 'all' 
                ? 'Try adjusting your search or filters to find your favorites.'
                : 'Start exploring restaurants and add them to your favorites for quick access!'
              }
            </p>
            <Link
              href="/dashboard/student/restaurants"
              className="btn-primary inline-flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Browse Restaurants
            </Link>
          </div>
        )}

        {/* Cart Sidebar */}
        <AnimatePresence>
          {showCart && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowCart(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {cart.length > 0 ? (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.itemId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-gray-500 text-xs">{item.restaurantName}</p>
                            <p className="text-sm font-medium">₦{item.price}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Your cart is empty</p>
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold text-lg">₦{getCartTotal()}</span>
                    </div>
                    <Link
                      href="/dashboard/student/checkout"
                      className="w-full btn-primary text-center"
                      onClick={() => setShowCart(false)}
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
