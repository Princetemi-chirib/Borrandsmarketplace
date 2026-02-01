'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  Star, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Image as ImageIcon,
  Camera,
  CheckCircle,
  X
} from 'lucide-react';

interface Review {
  _id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  orderId: string;
  orderNumber: string;
  rating: number;
  review: string;
  photos: string[];
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
}

interface Restaurant {
  _id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
}

export default function ReviewsPage() {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>([]);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ordersRes, restaurantsRes] = await Promise.all([
          fetch('/api/students/orders?status=all&limit=200', { headers }),
          fetch('/api/students/restaurants', { headers })
        ]);

        const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };
        const orders: any[] = ordersData.orders || [];

        const reviewsFromOrders: Review[] = orders
          .filter((o: any) => o.rating != null && o.review != null && String(o.review).trim() !== '')
          .map((o: any) => ({
            _id: o.id || o._id,
            restaurantId: o.restaurant?.id || o.restaurantId,
            restaurantName: o.restaurant?.name || 'Restaurant',
            restaurantImage: o.restaurant?.image || o.restaurant?.logo || '',
            orderId: o.id || o._id,
            orderNumber: o.orderNumber || `ORD-${o.id || o._id}`,
            rating: Number(o.rating),
            review: String(o.review),
            photos: [],
            helpful: 0,
            createdAt: new Date(o.ratedAt || o.updatedAt || o.createdAt),
            updatedAt: new Date(o.updatedAt || o.createdAt),
            isVerified: true
          }));

        setReviews(reviewsFromOrders);
        setFilteredReviews(reviewsFromOrders);

        if (restaurantsRes.ok) {
          const restJson = await restaurantsRes.json();
          const restList = (restJson.restaurants || restJson.favorites || []).map((r: any) => ({
            _id: r.id || r._id,
            name: r.name || '',
            image: r.image || r.logo || '',
            cuisine: r.cuisine || '',
            rating: r.rating ?? 0,
            reviewCount: r.reviewCount ?? 0
          }));
          setRestaurantsList(restList);
        }
      } catch (err) {
        console.error('Error fetching reviews data:', err);
        setReviews([]);
        setFilteredReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter and sort reviews
    let filtered = reviews.filter(review => {
      const matchesSearch = review.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.review.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
      return matchesSearch && matchesRating;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, ratingFilter, sortBy]);

  const deleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/students/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setReviews(reviews.filter(r => r._id !== reviewId));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      // For demo, remove from local state
      setReviews(reviews.filter(r => r._id !== reviewId));
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Fair';
      case 1: return 'Poor';
      default: return '';
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your restaurant reviews and ratings</p>
          </div>
          <button
            onClick={() => setShowAddReview(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Write Review</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 fill-current" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Helpful Votes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reviews.reduce((sum, r) => sum + r.helpful, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <ThumbsUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Verified Reviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reviews.filter(r => r.isVerified).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{review.restaurantName}</h3>
                          {review.isVerified && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                              {review.rating} ({getRatingText(review.rating)})
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Order #{review.orderNumber}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-3">{review.review}</p>

                        {/* Review Photos */}
                        {review.photos.length > 0 && (
                          <div className="flex space-x-2 mb-3">
                            {review.photos.map((photo, index) => (
                              <div
                                key={index}
                                className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center"
                              >
                                <ImageIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{review.helpful} helpful</span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {/* Edit review */}}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteReview(review._id)}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reviews found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || ratingFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : "You haven't written any reviews yet."
                }
              </p>
              {!searchTerm && ratingFilter === 'all' && (
                <button
                  onClick={() => setShowAddReview(true)}
                  className="btn-primary"
                >
                  Write Your First Review
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add Review Modal */}
        <AnimatePresence>
          {showAddReview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddReview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Write a Review</h2>
                  <button
                    onClick={() => setShowAddReview(false)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Restaurant Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Restaurant
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                      onChange={(e) => {
                        const restaurant = restaurantsList.find(r => r._id === e.target.value);
                        setSelectedRestaurant(restaurant || null);
                      }}
                    >
                      <option value="">Choose a restaurant...</option>
                      {restaurantsList.map(restaurant => (
                        <option key={restaurant._id} value={restaurant._id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className="text-2xl text-gray-300 dark:text-gray-500 hover:text-yellow-500 transition-colors"
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Review
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Share your experience with this restaurant..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add Photos (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Camera className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click to upload photos of your food
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAddReview(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="btn-primary">
                      Submit Review
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
