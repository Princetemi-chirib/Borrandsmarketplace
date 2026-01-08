'use client';
// Updated: Removed mock data, now fetches real data from /api/students/restaurants/[id]

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { getImageUrl, isValidImageUrl } from '@/lib/image-utils';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Truck, 
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Search,
  Filter,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  allergens: string[];
  preparationTime: number;
}

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
  phone: string;
  email: string;
  website: string;
  isFavorite: boolean;
  menu: MenuItem[];
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

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/students/restaurants/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load restaurant');
      const r = data.restaurant;
      const mapped: Restaurant = {
        _id: r._id,
        name: r.name,
        description: r.description,
        image: r.image,
        rating: r.rating,
        reviewCount: r.reviewCount,
        cuisine: r.cuisine,
        deliveryFee: r.deliveryFee,
        minimumOrder: r.minimumOrder,
        estimatedDeliveryTime: r.estimatedDeliveryTime,
        isOpen: r.isOpen,
        distance: r.distance,
        address: r.address,
        phone: r.phone,
        email: r.email,
        website: r.website,
        isFavorite: r.isFavorite,
        menu: (r.menu || []).map((m: any) => ({
          _id: m._id,
          name: m.name,
          description: m.description,
          price: m.price,
          image: m.image || '',
          category: m.category,
          isAvailable: m.isAvailable,
          isVegetarian: m.isVegetarian,
          isSpicy: m.isSpicy,
          allergens: m.allergens || [],
          preparationTime: m.preparationTime || 0,
        })),
      };
      setRestaurant(mapped);
    } catch (e) {
      console.error(e);
      setRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

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

    fetchRestaurant();
  }, [restaurantId]);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const toggleFavorite = async () => {
    if (!restaurant) return;
    
    try {
      const method = restaurant.isFavorite ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/students/favorites/${restaurant._id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setRestaurant({ ...restaurant, isFavorite: !restaurant.isFavorite });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // For demo, toggle in local state
      setRestaurant({ ...restaurant, isFavorite: !restaurant.isFavorite });
    }
  };

  const addToCart = (item: MenuItem) => {
    if (!restaurant) return;
    if (!restaurant.isOpen) {
      // Prevent adding items to cart when restaurant is closed
      return;
    }

    const existingItem = cart.find(cartItem => 
      cartItem.restaurantId === restaurant._id && cartItem.itemId === item._id
    );

    // Trigger animation
    setAddedItemId(item._id);
    setTimeout(() => setAddedItemId(null), 600);

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.restaurantId === restaurant._id && cartItem.itemId === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        itemId: item._id,
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

  const getFilteredMenu = () => {
    if (!restaurant) return [];

    let filtered = restaurant.menu.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'preparationTime':
          return a.preparationTime - b.preparationTime;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const categories = ['all', ...Array.from(new Set(restaurant?.menu.map(item => item.category) || []))];

  if (isLoading) {
    return (
      <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!restaurant) {
    return (
      <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Restaurant not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The restaurant you're looking for doesn't exist.</p>
          <Link href="/dashboard/student/restaurants" className="btn-primary">
            Back to Restaurants
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
      <div className="flex gap-6 relative">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
        {/* Back Arrow */}
        <div className="flex justify-start">
          <BackArrow href="/dashboard/student/restaurants" />
        </div>
        

        {/* Restaurant Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 right-4">
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full transition-colors ${
                  restaurant.isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`h-5 w-5 ${restaurant.isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl font-bold text-white mb-2">{restaurant.name}</h1>
              <p className="text-white/90 text-lg">{restaurant.cuisine}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900 dark:text-white">{restaurant.rating}</span>
                    <span className="text-gray-500 dark:text-gray-400">({restaurant.reviewCount} reviews)</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    restaurant.isOpen 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    {restaurant.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">{restaurant.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{restaurant.distance}km away</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{restaurant.estimatedDeliveryTime}min delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">₦{restaurant.deliveryFee} delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Min. ₦{restaurant.minimumOrder}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{restaurant.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>{restaurant.website}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Menu</h2>
            
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="preparationTime">Sort by Prep Time</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredMenu().map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0 overflow-hidden relative">
                      {isValidImageUrl(item.image) ? (
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-600">
                          <span className="text-xs text-gray-400 dark:text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {item.isVegetarian && (
                            <span className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">Veg</span>
                          )}
                          {item.isSpicy && (
                            <span className="px-1 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded">Spicy</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">₦{item.price}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{item.preparationTime}min</span>
                        </div>
                        <motion.button
                          onClick={() => addToCart(item)}
                          disabled={!item.isAvailable || !restaurant.isOpen}
                          whileTap={item.isAvailable && restaurant.isOpen ? { scale: 0.9 } : {}}
                          className={`p-2 rounded-lg transition-colors ${
                            item.isAvailable && restaurant.isOpen
                              ? 'bg-brand-primary text-white hover:bg-brand-accent'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </motion.button>
                      </div>

                      {!item.isAvailable && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Currently unavailable</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {getFilteredMenu().length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No menu items found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Always Visible Cart Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-3rem)] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Order</h2>
              {cart.length > 0 && (
                <span className="h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.itemId}
                      initial={addedItemId === item.itemId ? { scale: 0.8, opacity: 0 } : false}
                      animate={addedItemId === item.itemId ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30,
                        duration: 0.3
                      }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                        {isValidImageUrl(item.image) ? (
                          <img 
                            src={getImageUrl(item.image)} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                            <ShoppingBag className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{item.name}</p>
                        <p className="text-gray-500 dark:text-gray-300 text-xs truncate">{item.restaurantName}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">₦{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                          className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                          <Minus className="h-3 w-3 text-gray-700 dark:text-white" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                          className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                          <Plus className="h-3 w-3 text-gray-700 dark:text-white" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Add items to get started</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">₦{getCartTotal().toLocaleString()}</span>
                </div>
                {restaurant?.isOpen ? (
                  <Link
                    href="/dashboard/student/checkout"
                    className="w-full btn-primary text-center block"
                  >
                    Proceed to Checkout
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full btn-primary text-center cursor-not-allowed opacity-60"
                  >
                    Restaurant is closed
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart Button - Always visible on mobile */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Link
            href="/dashboard/student/checkout"
            className={`relative p-4 rounded-full shadow-lg transition-all ${
              cart.length > 0 
                ? 'bg-brand-primary text-white hover:bg-brand-accent scale-100' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 scale-90 opacity-50'
            }`}
          >
            <ShoppingBag className="h-6 w-6" />
            {cart.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
              >
                {cart.length}
              </motion.span>
            )}
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

