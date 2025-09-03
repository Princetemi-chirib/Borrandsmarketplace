'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
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
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock data for demonstration
  const mockRestaurant: Restaurant = {
    _id: '1',
    name: 'Pizza Palace',
    description: 'Authentic Italian pizza with fresh ingredients and traditional recipes passed down through generations. We use only the finest ingredients to create the perfect pizza experience.',
    image: '/images/pizza-palace.jpg',
    rating: 4.8,
    reviewCount: 156,
    cuisine: 'Italian',
    deliveryFee: 500,
    minimumOrder: 2000,
    estimatedDeliveryTime: 25,
    isOpen: true,
    distance: 1.2,
    address: 'University Mall, Block A, Floor 2',
    phone: '+234 801 234 5678',
    email: 'info@pizzapalace.com',
    website: 'www.pizzapalace.com',
    isFavorite: true,
    menu: [
      {
        _id: '1',
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
        price: 3500,
        image: '/images/margherita.jpg',
        category: 'Pizza',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        allergens: ['Gluten', 'Dairy'],
        preparationTime: 15
      },
      {
        _id: '2',
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni with melted cheese and tomato sauce',
        price: 4000,
        image: '/images/pepperoni.jpg',
        category: 'Pizza',
        isAvailable: true,
        isVegetarian: false,
        isSpicy: true,
        allergens: ['Gluten', 'Dairy', 'Pork'],
        preparationTime: 18
      },
      {
        _id: '3',
        name: 'Hawaiian Pizza',
        description: 'Ham and pineapple with cheese and tomato sauce',
        price: 3800,
        image: '/images/hawaiian.jpg',
        category: 'Pizza',
        isAvailable: true,
        isVegetarian: false,
        isSpicy: false,
        allergens: ['Gluten', 'Dairy', 'Pork'],
        preparationTime: 16
      },
      {
        _id: '4',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
        price: 1800,
        image: '/images/caesar-salad.jpg',
        category: 'Salads',
        isAvailable: true,
        isVegetarian: false,
        isSpicy: false,
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        preparationTime: 8
      },
      {
        _id: '5',
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs',
        price: 800,
        image: '/images/garlic-bread.jpg',
        category: 'Sides',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        allergens: ['Gluten', 'Dairy'],
        preparationTime: 5
      },
      {
        _id: '6',
        name: 'Chicken Wings',
        description: 'Crispy wings with your choice of sauce',
        price: 2500,
        image: '/images/chicken-wings.jpg',
        category: 'Sides',
        isAvailable: true,
        isVegetarian: false,
        isSpicy: true,
        allergens: ['Gluten'],
        preparationTime: 12
      },
      {
        _id: '7',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        price: 1200,
        image: '/images/tiramisu.jpg',
        category: 'Desserts',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        preparationTime: 3
      },
      {
        _id: '8',
        name: 'Coca Cola',
        description: 'Refreshing soft drink',
        price: 300,
        image: '/images/coca-cola.jpg',
        category: 'Beverages',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        allergens: [],
        preparationTime: 1
      }
    ]
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

    // Simulate API call
    setTimeout(() => {
      setRestaurant(mockRestaurant);
      setIsLoading(false);
    }, 1000);
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

    const existingItem = cart.find(cartItem => 
      cartItem.restaurantId === restaurant._id && cartItem.itemId === item._id
    );

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant not found</h2>
          <p className="text-gray-500 mb-4">The restaurant you're looking for doesn't exist.</p>
          <Link href="/dashboard/student/restaurants" className="btn-primary">
            Back to Restaurants
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
      <div className="space-y-6">
        {/* Back Arrow */}
        <div className="flex justify-start">
          <BackArrow href="/dashboard/student/restaurants" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between">
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

        {/* Restaurant Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative h-64 bg-gray-200">
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
                    <span className="font-semibold">{restaurant.rating}</span>
                    <span className="text-gray-500">({restaurant.reviewCount} reviews)</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    restaurant.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{restaurant.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{restaurant.distance}km away</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{restaurant.estimatedDeliveryTime}min delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">₦{restaurant.deliveryFee} delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Min. ₦{restaurant.minimumOrder}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu</h2>
            
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {item.isVegetarian && (
                            <span className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">Veg</span>
                          )}
                          {item.isSpicy && (
                            <span className="px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded">Spicy</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">₦{item.price}</span>
                          <span className="text-xs text-gray-500">{item.preparationTime}min</span>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.isAvailable}
                          className={`p-2 rounded-lg transition-colors ${
                            item.isAvailable
                              ? 'bg-brand-primary text-white hover:bg-brand-accent'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {!item.isAvailable && (
                        <p className="text-xs text-red-600 mt-1">Currently unavailable</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {getFilteredMenu().length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>

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
                  <h2 className="text-lg font-semibold">Your Order</h2>
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

