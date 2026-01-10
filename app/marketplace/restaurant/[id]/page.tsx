'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Truck, 
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Filter,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  LogIn
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  preparationTime: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  image: string;
  isOpen: boolean;
  cuisine: string[];
  address: string;
  phone: string;
  categories: string[];
  menu: MenuItem[];
}

export default function PublicRestaurantDetail() {
  const params = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Mock restaurant data
  const mockRestaurant: Restaurant = {
    id: '1',
    name: 'Campus Delight',
    description: 'Authentic Nigerian cuisine with a modern twist. Fresh ingredients and traditional recipes.',
    rating: 4.8,
    reviews: 156,
    deliveryTime: '15-25 min',
    deliveryFee: 200,
    minOrder: 1500,
    image: '/images/restaurant1.jpg',
    isOpen: true,
    cuisine: ['Nigerian', 'Continental'],
    address: 'Block A, University Campus',
    phone: '+234 801 234 5678',
    categories: ['All', 'Main Course', 'Appetizers', 'Beverages', 'Desserts'],
    menu: [
      {
        id: '1',
        name: 'Jollof Rice with Chicken',
        description: 'Spicy rice cooked with tomatoes, peppers, and tender chicken',
        price: 1200,
        image: '/images/jollof-rice.jpg',
        category: 'Main Course',
        isAvailable: true,
        preparationTime: 15
      },
      {
        id: '2',
        name: 'Egusi Soup with Pounded Yam',
        description: 'Ground melon seed soup with smooth pounded yam',
        price: 1500,
        image: '/images/egusi-soup.jpg',
        category: 'Main Course',
        isAvailable: true,
        isVegetarian: false,
        preparationTime: 20
      },
      {
        id: '3',
        name: 'Suya',
        description: 'Spicy grilled meat skewers with groundnut powder',
        price: 800,
        image: '/images/suya.jpg',
        category: 'Appetizers',
        isAvailable: true,
        isSpicy: true,
        preparationTime: 10
      },
      {
        id: '4',
        name: 'Plantain',
        description: 'Fried ripe plantain slices',
        price: 300,
        image: '/images/plantain.jpg',
        category: 'Appetizers',
        isAvailable: true,
        isVegetarian: true,
        preparationTime: 8
      },
      {
        id: '5',
        name: 'Zobo',
        description: 'Refreshing hibiscus drink',
        price: 200,
        image: '/images/zobo.jpg',
        category: 'Beverages',
        isAvailable: true,
        isVegetarian: true,
        preparationTime: 5
      },
      {
        id: '6',
        name: 'Puff Puff',
        description: 'Sweet fried dough balls',
        price: 250,
        image: '/images/puff-puff.jpg',
        category: 'Desserts',
        isAvailable: true,
        isVegetarian: true,
        preparationTime: 12
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRestaurant(mockRestaurant);
      setIsLoading(false);
    }, 1000);
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Show login prompt instead of going directly to checkout
    setShowLoginPrompt(true);
    setShowCart(false);
  };

  const filteredMenu = restaurant?.menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Restaurant not found</h3>
          <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/marketplace"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              {/* Restaurant Logo */}
              {restaurant.logo && restaurant.logo.trim() !== '' && (
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden border border-gray-200">
                  <img
                    src={restaurant.logo.startsWith('http') || restaurant.logo.startsWith('/') ? restaurant.logo : `/${restaurant.logo}`}
                    alt={`${restaurant.name} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-sm text-gray-600">{restaurant.cuisine.join(', ')}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Restaurant Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {/* Restaurant Logo - Large Display */}
              {restaurant.logo && restaurant.logo.trim() !== '' && (
                <div className="mb-4">
                  <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    <img
                      src={restaurant.logo.startsWith('http') || restaurant.logo.startsWith('/') ? restaurant.logo : `/${restaurant.logo}`}
                      alt={`${restaurant.name} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900">{restaurant.rating}</span>
                <span className="text-gray-600">({restaurant.reviews} reviews)</span>
              </div>
              <p className="text-gray-700 mb-4">{restaurant.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Truck className="h-4 w-4" />
                  <span>₦{restaurant.deliveryFee} delivery</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </div>
              <p className="text-sm text-gray-600 mt-2">Min. order: ₦{restaurant.minOrder.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              {restaurant.categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">Not Available</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 flex space-x-1">
                  {item.isVegetarian && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Veg
                    </span>
                  )}
                  {item.isSpicy && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Spicy
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-lg font-bold text-gray-900">₦{item.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.preparationTime} min</span>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.isAvailable}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      item.isAvailable
                        ? 'bg-brand-primary text-white hover:bg-brand-accent'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMenu.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600">Add some delicious items to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">₦{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">₦{getCartTotal().toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-brand-primary text-white py-3 rounded-lg font-medium hover:bg-brand-accent transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-brand-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
              <p className="text-gray-600 mb-6">
                You need to sign in to complete your order and track your delivery.
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="w-full bg-brand-primary text-white py-3 rounded-lg font-medium hover:bg-brand-accent transition-colors block"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors block"
                >
                  Create Account
                </Link>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
                >
                  Continue browsing
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
