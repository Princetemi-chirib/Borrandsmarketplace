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
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ name: string; category: string; currentStock: number; minStockLevel: number; maxStockLevel: number; unit: string; costPerUnit: number; lastRestocked?: string; supplier?: string; expiryDate?: string; location?: string }>({
    name: '',
    category: '',
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    unit: '',
    costPerUnit: 0,
    lastRestocked: '',
    supplier: '',
    expiryDate: '',
    location: ''
  });

  // Load inventory and alerts from live APIs
  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || '';
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
      const [itemsRes, alertsRes] = await Promise.all([
        fetch('/api/inventory', { headers, credentials: 'include' }),
        fetch('/api/inventory/alerts', { headers, credentials: 'include' })
      ]);
      const itemsJson = await itemsRes.json();
      const alertsJson = await alertsRes.json();
      
      if (itemsRes.ok && itemsJson.items) {
        // Normalize: map id to _id, status to lowercase
        const normalizedItems = itemsJson.items.map((item: any) => ({
          ...item,
          _id: item.id || item._id,
          status: item.status?.toLowerCase() || 'in_stock'
        }));
        setInventoryItems(normalizedItems);
      }
      
      if (alertsRes.ok && alertsJson.alerts) {
        // Normalize: map id to _id, priority to lowercase
        const normalizedAlerts = alertsJson.alerts.map((alert: any) => ({
          ...alert,
          _id: alert.id || alert._id,
          priority: alert.priority?.toLowerCase() || 'medium'
        }));
        setStockAlerts(normalizedAlerts);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    loadInventory();
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

  const openCreate = () => {
    setEditingItem(null);
    setForm({ name: '', category: '', currentStock: 0, minStockLevel: 0, maxStockLevel: 0, unit: '', costPerUnit: 0, lastRestocked: '', supplier: '', expiryDate: '', location: '' });
    setShowAddModal(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      category: item.category || '',
      currentStock: item.currentStock || 0,
      minStockLevel: item.minStockLevel || 0,
      maxStockLevel: item.maxStockLevel || 0,
      unit: item.unit || '',
      costPerUnit: item.costPerUnit || 0,
      lastRestocked: item.lastRestocked ? String(item.lastRestocked).slice(0,10) : '',
      supplier: item.supplier || '',
      expiryDate: item.expiryDate ? String(item.expiryDate).slice(0,10) : '',
      location: item.location || ''
    } as any);
    setShowAddModal(true);
  };

  const submitForm = async () => {
    if (!form.name.trim() || !form.category.trim() || !form.unit.trim()) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('token') || '';
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const payload: any = {
        name: form.name,
        category: form.category,
        currentStock: Number(form.currentStock) || 0,
        minStockLevel: Number(form.minStockLevel) || 0,
        maxStockLevel: Number(form.maxStockLevel) || 0,
        unit: form.unit,
        costPerUnit: Number(form.costPerUnit) || 0,
        supplier: form.supplier || undefined,
        location: form.location || undefined,
      };
      if (form.lastRestocked) payload.lastRestocked = new Date(form.lastRestocked).toISOString();
      if (form.expiryDate) payload.expiryDate = new Date(form.expiryDate).toISOString();

      if (editingItem) {
        const res = await fetch(`/api/inventory/${editingItem._id}`, { method: 'PATCH', headers, credentials: 'include', body: JSON.stringify(payload) });
        const json = await res.json();
        if (res.ok && json.item) {
          setInventoryItems(prev => prev.map(it => (it._id === editingItem._id ? json.item : it)) as any);
        }
      } else {
        const res = await fetch('/api/inventory', { method: 'POST', headers, credentials: 'include', body: JSON.stringify(payload) });
        const json = await res.json();
        if (res.ok && json.item) {
          setInventoryItems(prev => [json.item, ...prev] as any);
        }
      }
      // refresh alerts
      try {
        const token2 = localStorage.getItem('token') || '';
        const headers2: any = token2 ? { Authorization: `Bearer ${token2}` } : {};
        const alertsRes = await fetch('/api/inventory/alerts', { headers: headers2, credentials: 'include' });
        const alertsJson = await alertsRes.json();
        if (alertsRes.ok && alertsJson.alerts) setStockAlerts(alertsJson.alerts);
      } catch {}
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE', headers, credentials: 'include' });
      if (res.ok) setInventoryItems(prev => prev.filter(x => x._id !== id));
    } catch {}
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
              onClick={openCreate}
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
              <button onClick={loadInventory} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                        <button onClick={() => openEdit(item)} className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteItem(item._id)} className="text-red-600 hover:text-red-900">
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
      <InventoryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        form={form}
        setForm={setForm as any}
        onSubmit={submitForm}
        saving={saving}
        editing={Boolean(editingItem)}
      />
    </DashboardLayout>
  );
}

// Add/Edit Modal
// (inline within same file; kept simple and minimal styles)

function InventoryModal({ open, onClose, form, setForm, onSubmit, saving, editing }:{ open:boolean; onClose:()=>void; form:any; setForm:(f:any)=>void; onSubmit:()=>void; saving:boolean; editing:boolean }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl sm:shadow-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{editing? 'Edit Item':'Add Item'}</h3>
          <button onClick={onClose} className="px-3 py-1.5 border rounded-lg">Close</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} placeholder="e.g., Chicken Breast" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input value={form.category} onChange={(e)=>setForm({ ...form, category: e.target.value })} placeholder="e.g., Meat" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current stock</label>
            <input type="number" value={form.currentStock} onChange={(e)=>setForm({ ...form, currentStock: Number(e.target.value||0) })} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min stock</label>
            <input type="number" value={form.minStockLevel} onChange={(e)=>setForm({ ...form, minStockLevel: Number(e.target.value||0) })} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max stock</label>
            <input type="number" value={form.maxStockLevel} onChange={(e)=>setForm({ ...form, maxStockLevel: Number(e.target.value||0) })} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input value={form.unit} onChange={(e)=>setForm({ ...form, unit: e.target.value })} placeholder="e.g., kg, pcs" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost per unit</label>
            <input type="number" value={form.costPerUnit} onChange={(e)=>setForm({ ...form, costPerUnit: Number(e.target.value||0) })} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <input type="date" value={form.lastRestocked||''} onChange={(e)=>setForm({ ...form, lastRestocked: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input value={form.supplier||''} onChange={(e)=>setForm({ ...form, supplier: e.target.value })} placeholder="Supplier (optional)" className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="date" value={form.expiryDate||''} onChange={(e)=>setForm({ ...form, expiryDate: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input value={form.location||''} onChange={(e)=>setForm({ ...form, location: e.target.value })} placeholder="Location (e.g., Freezer A1)" className="px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button onClick={onSubmit} disabled={saving} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent disabled:opacity-50">{saving? 'Saving...': (editing? 'Save changes':'Create item')}</button>
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}

