'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  AlertCircle,
  MoreHorizontal,
  Grid,
  List,
  Settings,
  Copy,
  EyeOff
} from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  itemCount: number;
}

export default function MenuManagement() {
  const [user, setUser] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Mock data
  const mockMenuItems: MenuItem[] = [
    {
      _id: '1',
      name: 'Jollof Rice with Chicken',
      description: 'Traditional Nigerian jollof rice served with grilled chicken and vegetables',
      price: 1200,
      category: 'Main Course',
      image: '/images/jollof-rice.jpg',
      isAvailable: true,
      isFeatured: true,
      preparationTime: 25,
      ingredients: ['Rice', 'Chicken', 'Tomatoes', 'Onions', 'Pepper'],
      allergens: ['None'],
      nutritionInfo: {
        calories: 650,
        protein: 35,
        carbs: 45,
        fat: 20
      },
      tags: ['Popular', 'Traditional', 'Spicy'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      _id: '2',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
      price: 2500,
      category: 'Pizza',
      image: '/images/margherita-pizza.jpg',
      isAvailable: true,
      isFeatured: false,
      preparationTime: 20,
      ingredients: ['Pizza Dough', 'Tomato Sauce', 'Mozzarella', 'Basil'],
      allergens: ['Gluten', 'Dairy'],
      nutritionInfo: {
        calories: 800,
        protein: 30,
        carbs: 60,
        fat: 25
      },
      tags: ['Italian', 'Vegetarian'],
      createdAt: '2024-01-02',
      updatedAt: '2024-01-14'
    },
    {
      _id: '3',
      name: 'Classic Burger',
      description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
      price: 1800,
      category: 'Burgers',
      image: '/images/classic-burger.jpg',
      isAvailable: false,
      isFeatured: false,
      preparationTime: 15,
      ingredients: ['Beef Patty', 'Bun', 'Lettuce', 'Tomato', 'Onion', 'Sauce'],
      allergens: ['Gluten', 'Dairy'],
      nutritionInfo: {
        calories: 750,
        protein: 40,
        carbs: 35,
        fat: 35
      },
      tags: ['American', 'Beef'],
      createdAt: '2024-01-03',
      updatedAt: '2024-01-13'
    },
    {
      _id: '4',
      name: 'Chicken Wings',
      description: 'Crispy chicken wings with your choice of sauce',
      price: 1500,
      category: 'Appetizers',
      image: '/images/chicken-wings.jpg',
      isAvailable: true,
      isFeatured: true,
      preparationTime: 18,
      ingredients: ['Chicken Wings', 'Flour', 'Spices', 'Sauce'],
      allergens: ['Gluten'],
      nutritionInfo: {
        calories: 450,
        protein: 25,
        carbs: 15,
        fat: 30
      },
      tags: ['Spicy', 'Crispy'],
      createdAt: '2024-01-04',
      updatedAt: '2024-01-12'
    },
    {
      _id: '5',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing, croutons, and parmesan cheese',
      price: 800,
      category: 'Salads',
      image: '/images/caesar-salad.jpg',
      isAvailable: true,
      isFeatured: false,
      preparationTime: 10,
      ingredients: ['Romaine Lettuce', 'Caesar Dressing', 'Croutons', 'Parmesan'],
      allergens: ['Dairy', 'Gluten'],
      nutritionInfo: {
        calories: 300,
        protein: 15,
        carbs: 20,
        fat: 20
      },
      tags: ['Healthy', 'Fresh'],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-11'
    }
  ];

  const mockCategories: Category[] = [
    { _id: '1', name: 'Main Course', description: 'Hearty main dishes', itemCount: 1 },
    { _id: '2', name: 'Pizza', description: 'Wood-fired pizzas', itemCount: 1 },
    { _id: '3', name: 'Burgers', description: 'Gourmet burgers', itemCount: 1 },
    { _id: '4', name: 'Appetizers', description: 'Starters and snacks', itemCount: 1 },
    { _id: '5', name: 'Salads', description: 'Fresh and healthy salads', itemCount: 1 }
  ];

  const availabilityOptions = ['All', 'Available', 'Unavailable'];
  const categoryOptions = ['All', ...mockCategories.map(cat => cat.name)];

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

    // Simulate API call
    setTimeout(() => {
      setMenuItems(mockMenuItems);
      setCategories(mockCategories);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesAvailability = selectedAvailability === 'All' || 
                               (selectedAvailability === 'Available' && item.isAvailable) ||
                               (selectedAvailability === 'Unavailable' && !item.isAvailable);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const toggleAvailability = (itemId: string) => {
    setMenuItems(items => 
      items.map(item => 
        item._id === itemId 
          ? { ...item, isAvailable: !item.isAvailable }
          : item
      )
    );
  };

  const toggleFeatured = (itemId: string) => {
    setMenuItems(items => 
      items.map(item => 
        item._id === itemId 
          ? { ...item, isFeatured: !item.isFeatured }
          : item
      )
    );
  };

  const deleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(items => items.filter(item => item._id !== itemId));
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="restaurant" userName={user?.name || 'Restaurant'}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const userName = user?.name || 'Restaurant';
  const displayName = userName === 'Restaurant' ? 'Restaurant' : userName;

  return (
    <DashboardLayout userRole="restaurant" userName={displayName}>
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <BackArrow href="/dashboard/restaurant" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600">Manage your restaurant's menu items and categories</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="h-4 w-4" />
              <span>Categories</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>
        </motion.div>
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent w-full sm:w-64"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        {viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Item Image */}
                <div className="relative h-48 bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  {item.isFeatured && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => toggleAvailability(item._id)}
                      className={`p-2 rounded-full ${
                        item.isAvailable 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {item.isAvailable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => toggleFeatured(item._id)}
                        className={`p-1 rounded ${
                          item.isFeatured ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-gray-900">₦{item.price.toLocaleString()}</span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.preparationTime} min
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{item.category}</span>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteItem(item._id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Menu Items</h3>
                <span className="text-sm text-gray-600">{filteredItems.length} items</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prep Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₦{item.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.preparationTime} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleAvailability(item._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.isAvailable 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            {item.isAvailable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setEditingItem(item)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteItem(item._id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-4">No menu items match your current filters</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
