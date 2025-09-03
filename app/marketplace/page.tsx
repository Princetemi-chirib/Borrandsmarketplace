'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MapPin, 
  ShoppingBag,
  Heart,
  Truck,
  Phone,
  Globe,
  ChevronDown,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const categories = ['All', 'Fast Food', 'Local Cuisine', 'Pizza', 'Burgers', 'Asian', 'African', 'Desserts', 'Beverages'];
  
  const restaurants = [
    {
      id: 1,
      name: 'Campus Delight',
      category: 'Local Cuisine',
      rating: 4.8,
      reviews: 156,
      deliveryTime: '15-25 min',
      deliveryFee: '₦200',
      minOrder: '₦1,500',
      image: '/images/restaurant1.jpg',
      isOpen: true,
      isFavorite: false,
      cuisine: ['Nigerian', 'Continental'],
      tags: ['Popular', 'Fast Delivery']
    },
    {
      id: 2,
      name: 'Pizza Palace',
      category: 'Pizza',
      rating: 4.6,
      reviews: 89,
      deliveryTime: '20-30 min',
      deliveryFee: '₦150',
      minOrder: '₦2,000',
      image: '/images/restaurant2.jpg',
      isOpen: true,
      isFavorite: true,
      cuisine: ['Italian', 'Pizza'],
      tags: ['Best Seller']
    },
    {
      id: 3,
      name: 'Burger House',
      category: 'Burgers',
      rating: 4.4,
      reviews: 203,
      deliveryTime: '12-20 min',
      deliveryFee: '₦100',
      minOrder: '₦1,200',
      image: '/images/restaurant3.jpg',
      isOpen: true,
      isFavorite: false,
      cuisine: ['American', 'Fast Food'],
      tags: ['Quick Service']
    },
    {
      id: 4,
      name: 'Asian Fusion',
      category: 'Asian',
      rating: 4.7,
      reviews: 67,
      deliveryTime: '25-35 min',
      deliveryFee: '₦250',
      minOrder: '₦2,500',
      image: '/images/restaurant4.jpg',
      isOpen: false,
      isFavorite: false,
      cuisine: ['Chinese', 'Thai'],
      tags: ['Premium']
    },
    {
      id: 5,
      name: 'Sweet Treats',
      category: 'Desserts',
      rating: 4.9,
      reviews: 45,
      deliveryTime: '10-15 min',
      deliveryFee: '₦100',
      minOrder: '₦800',
      image: '/images/restaurant5.jpg',
      isOpen: true,
      isFavorite: true,
      cuisine: ['Desserts', 'Beverages'],
      tags: ['Student Favorite']
    },
    {
      id: 6,
      name: 'Campus Coffee',
      category: 'Beverages',
      rating: 4.5,
      reviews: 178,
      deliveryTime: '8-12 min',
      deliveryFee: '₦50',
      minOrder: '₦500',
      image: '/images/restaurant6.jpg',
      isOpen: true,
      isFavorite: false,
      cuisine: ['Coffee', 'Snacks'],
      tags: ['Quick Pickup']
    }
  ];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || restaurant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'deliveryTime':
        return parseInt(a.deliveryTime.split('-')[0]) - parseInt(b.deliveryTime.split('-')[0]);
      case 'deliveryFee':
        return parseInt(a.deliveryFee.replace('₦', '')) - parseInt(b.deliveryFee.replace('₦', ''));
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campus Marketplace</h1>
                <p className="text-gray-600 mt-1">Discover amazing food from campus restaurants</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent w-64"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Categories */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Categories */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                <option value="rating">Rating</option>
                <option value="deliveryTime">Delivery Time</option>
                <option value="deliveryFee">Delivery Fee</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Restaurant Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                    <Heart className={`h-4 w-4 ${restaurant.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 flex space-x-1">
                  {restaurant.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-brand-primary/90 text-white rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{restaurant.rating}</span>
                    <span className="text-sm text-gray-500">({restaurant.reviews})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm text-gray-600">{restaurant.category}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{restaurant.cuisine.join(', ')}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="h-4 w-4" />
                      <span>{restaurant.deliveryFee}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Min: {restaurant.minOrder}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link 
                    href={`/marketplace/restaurant/${restaurant.id}`} 
                    className="flex-1 bg-brand-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-brand-accent transition-colors text-center"
                  >
                    View Menu
                  </Link>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {sortedRestaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}





