'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Settings
} from 'lucide-react';

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  costPerUnit: number;
  lastRestocked: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  expiryDate?: string;
  location: string;
}

interface StockAlert {
  _id: string;
  itemName: string;
  currentStock: number;
  minLevel: number;
  priority: 'high' | 'medium' | 'low';
  daysUntilOut: number;
}

export default function InventoryManagement() {
  const [user, setUser] = useState<any>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const mockInventoryItems: InventoryItem[] = [
    {
      _id: '1',
      name: 'Chicken Breast',
      category: 'Meat',
      currentStock: 15,
      minStockLevel: 10,
      maxStockLevel: 50,
      unit: 'kg',
      costPerUnit: 1200,
      lastRestocked: '2024-01-10',
      supplier: 'Fresh Foods Ltd',
      status: 'in_stock',
      expiryDate: '2024-01-25',
      location: 'Freezer A1'
    },
    {
      _id: '2',
      name: 'Tomatoes',
      category: 'Vegetables',
      currentStock: 5,
      minStockLevel: 8,
      maxStockLevel: 30,
      unit: 'kg',
      costPerUnit: 300,
      lastRestocked: '2024-01-12',
      supplier: 'Green Valley Farms',
      status: 'low_stock',
      expiryDate: '2024-01-20',
      location: 'Refrigerator B2'
    },
    {
      _id: '3',
      name: 'Cooking Oil',
      category: 'Pantry',
      currentStock: 0,
      minStockLevel: 5,
      maxStockLevel: 20,
      unit: 'liters',
      costPerUnit: 800,
      lastRestocked: '2024-01-05',
      supplier: 'Oil Distributors',
      status: 'out_of_stock',
      location: 'Shelf C3'
    },
    {
      _id: '4',
      name: 'Rice',
      category: 'Grains',
      currentStock: 25,
      minStockLevel: 10,
      maxStockLevel: 100,
      unit: 'kg',
      costPerUnit: 500,
      lastRestocked: '2024-01-08',
      supplier: 'Grain Suppliers',
      status: 'in_stock',
      location: 'Storage D1'
    },
    {
      _id: '5',
      name: 'Onions',
      category: 'Vegetables',
      currentStock: 3,
      minStockLevel: 5,
      maxStockLevel: 25,
      unit: 'kg',
      costPerUnit: 200,
      lastRestocked: '2024-01-11',
      supplier: 'Fresh Produce Co',
      status: 'low_stock',
      location: 'Refrigerator B1'
    }
  ];

  const mockStockAlerts: StockAlert[] = [
    {
      _id: '1',
      itemName: 'Cooking Oil',
      currentStock: 0,
      minLevel: 5,
      priority: 'high',
      daysUntilOut: 0
    },
    {
      _id: '2',
      itemName: 'Tomatoes',
      currentStock: 5,
      minLevel: 8,
      priority: 'medium',
      daysUntilOut: 2
    },
    {
      _id: '3',
      itemName: 'Onions',
      currentStock: 3,
      minLevel: 5,
      priority: 'medium',
      daysUntilOut: 1
    }
  ];

  const categories = ['All', 'Meat', 'Vegetables', 'Pantry', 'Grains', 'Dairy', 'Beverages'];
  const statuses = ['All', 'in_stock', 'low_stock', 'out_of_stock'];

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
      setInventoryItems(mockInventoryItems);
      setStockAlerts(mockStockAlerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="h-4 w-4" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
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
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Track and manage your restaurant's inventory</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
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
        {/* Stock Alerts */}
        {stockAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">Stock Alerts</h3>
                  </div>
                  <span className="text-sm text-red-600">{stockAlerts.length} items need attention</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stockAlerts.map((alert) => (
                    <div key={alert._id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-red-900">{alert.itemName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-red-700">
                          Current: {alert.currentStock} units
                        </p>
                        <p className="text-sm text-red-700">
                          Minimum: {alert.minLevel} units
                        </p>
                        {alert.daysUntilOut === 0 ? (
                          <p className="text-sm font-medium text-red-800">OUT OF STOCK</p>
                        ) : (
                          <p className="text-sm text-red-700">
                            {alert.daysUntilOut} days until out of stock
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
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
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Inventory Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
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
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost/Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Restocked
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category} • {item.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-900">{item.currentStock} {item.unit}</span>
                            <span className="text-gray-500">/ {item.maxStockLevel}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${
                                item.status === 'out_of_stock' ? 'bg-red-500' :
                                item.status === 'low_stock' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${getStockPercentage(item.currentStock, item.maxStockLevel)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{item.costPerUnit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.lastRestocked).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">No inventory items match your current filters</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
