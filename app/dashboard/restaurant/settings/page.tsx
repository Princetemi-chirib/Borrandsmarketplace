'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  Save, 
  Clock, 
  MapPin, 
  Phone, 
  Globe, 
  DollarSign, 
  Truck, 
  Settings, 
  Store, 
  CheckCircle, 
  AlertTriangle,
  Edit,
  Camera,
  Upload,
  X,
  Plus,
  Minus,
  Image as ImageIcon
} from 'lucide-react';
import { getImageUrl, isValidImageUrl } from '@/lib/image-utils';

interface RestaurantSettings {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  university: string;
  cuisine: string[];
  isOpen: boolean;
  internalDeliveryEnabled: boolean;
  autoPayoutEnabled: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  image: string;
  logo: string;
  bannerImage: string;
  features: string[];
  paymentMethods: string[];
  operatingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  location: {
    type: string;
    coordinates: number[];
  };
  payoutBankCode?: string;
  payoutBankName?: string;
  payoutAccountNumber?: string;
  payoutAccountName?: string;
}

const cuisineOptions = [
  'Nigerian', 'Chinese', 'Italian', 'Indian', 'American', 'Mexican', 
  'Mediterranean', 'Thai', 'Japanese', 'Korean', 'African', 'Fast Food',
  'Pizza', 'Burgers', 'Seafood', 'Vegetarian', 'Vegan', 'Desserts'
];

const featureOptions = [
  'free-delivery', 'fast-delivery', 'student-discount', 'halal', 
  'vegetarian-friendly', '24-7', 'breakfast', 'lunch', 'dinner', 'late-night'
];

const paymentMethodOptions = [
  'cash', 'card', 'mobile-money', 'bank-transfer'
];

const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function normalizeSettingsPayload(s: RestaurantSettings): RestaurantSettings {
  return {
    ...s,
    autoPayoutEnabled: !!s.autoPayoutEnabled,
    internalDeliveryEnabled: !!s.internalDeliveryEnabled,
  };
}

export default function RestaurantSettings() {
  const [user, setUser] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newCuisine, setNewCuisine] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [banks, setBanks] = useState<Array<{ name: string; code: string }>>([]);
  const [payoutResolving, setPayoutResolving] = useState(false);
  const [payoutResolveError, setPayoutResolveError] = useState('');

  // Form states
  const [formData, setFormData] = useState<RestaurantSettings | null>(null);

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

    // Fetch restaurant data
    fetchRestaurantData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'features' || banks.length > 0) return;
    fetch('/api/paystack/banks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.banks)) setBanks(data.banks);
      })
      .catch(() => {});
  }, [activeTab, banks.length]);

  const fetchRestaurantData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/restaurant/settings', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeSettingsPayload(data.settings);
        setRestaurant(normalized);
        setFormData(normalized);
      } else {
        console.error('Failed to fetch restaurant settings');
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...(prev.operatingHours?.[day as keyof typeof prev.operatingHours] || { open: '08:00', close: '22:00', isOpen: true }),
          [field]: value
        }
      }
    }) : null);
  };

  const addCuisine = () => {
    if (newCuisine.trim() && !formData?.cuisine?.includes(newCuisine.trim())) {
      setFormData(prev => prev ? ({
        ...prev,
        cuisine: [...(prev.cuisine || []), newCuisine.trim()]
      }) : null);
      setNewCuisine('');
    }
  };

  const removeCuisine = (cuisine: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      cuisine: prev.cuisine?.filter(c => c !== cuisine) || []
    }) : null);
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature]
    }) : null);
  };

  const togglePaymentMethod = (method: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      paymentMethods: prev.paymentMethods?.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...(prev.paymentMethods || []), method]
    }) : null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setShowError(false);
    setShowSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/restaurant/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData?.name,
          description: formData?.description,
          address: formData?.address,
          phone: formData?.phone,
          website: formData?.website,
          university: formData?.university,
          cuisine: formData?.cuisine,
          operatingHours: formData?.operatingHours,
          deliveryFee: formData?.deliveryFee,
          internalDeliveryEnabled: formData?.internalDeliveryEnabled,
          autoPayoutEnabled: formData?.autoPayoutEnabled,
          minimumOrder: formData?.minimumOrder,
          estimatedDeliveryTime: formData?.estimatedDeliveryTime,
          features: formData?.features,
          paymentMethods: formData?.paymentMethods,
          logo: formData?.logo,
          image: formData?.image,
          bannerImage: formData?.bannerImage,
          payoutBankCode: formData?.payoutBankCode,
          payoutBankName: formData?.payoutBankName,
          payoutAccountNumber: formData?.payoutAccountNumber,
          payoutAccountName: formData?.payoutAccountName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeSettingsPayload(data.settings);
        setRestaurant(normalized);
        setFormData(normalized);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to update settings');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
        // Revert form data on error
        if (restaurant) {
          setFormData(restaurant);
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setErrorMessage('Network error. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRestaurantStatus = async () => {
    const newStatus = !formData?.isOpen;
    setFormData(prev => prev ? ({ ...prev, isOpen: newStatus }) : null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/restaurants/toggle-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isOpen: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurant(data.restaurant);
        setFormData(data.restaurant);
      } else {
        // Revert on error
        setFormData(prev => prev ? ({ ...prev, isOpen: !newStatus }) : null);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      setFormData(prev => prev ? ({ ...prev, isOpen: !newStatus }) : null);
    }
  };

  if (isLoading || !formData) {
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
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
              <p className="text-gray-600">Manage your restaurant information and preferences</p>
            </div>
          </div>
          
          {/* Restaurant Status Toggle */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Restaurant Status</p>
              <p className={`text-sm font-medium ${formData?.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {formData?.isOpen ? 'Open' : 'Closed'}
              </p>
            </div>
            <button
              onClick={toggleRestaurantStatus}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData?.isOpen ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData?.isOpen ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">Settings updated successfully!</p>
          </motion.div>
        )}

        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{errorMessage}</p>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', label: 'Basic Info', icon: Store },
                { id: 'hours', label: 'Operating Hours', icon: Clock },
                { id: 'delivery', label: 'Delivery Settings', icon: Truck },
                { id: 'features', label: 'Features & Payment', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Internal delivery</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          When enabled, this restaurant handles delivery entirely in-house.
                          Riders are not notified and order delivery status is managed from the restaurant dashboard.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('internalDeliveryEnabled', !formData.internalDeliveryEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.internalDeliveryEnabled ? 'bg-brand-primary' : 'bg-gray-300'
                        }`}
                        aria-label="Toggle internal delivery"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.internalDeliveryEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="mt-2 text-xs font-medium text-gray-700">
                      Current mode: {formData.internalDeliveryEnabled ? 'Internal delivery' : 'Rider marketplace'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="Enter restaurant name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University *
                    </label>
                    <input
                      type="text"
                      value={formData.university || ''}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="Enter university name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="Enter full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="Describe your restaurant, specialties, and what makes it unique"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.description || '').length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Types
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.cuisine?.map((cuisine) => (
                      <span
                        key={cuisine}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-primary text-white"
                      >
                        {cuisine}
                        <button
                          onClick={() => removeCuisine(cuisine)}
                          className="ml-2 hover:text-gray-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={newCuisine}
                      onChange={(e) => setNewCuisine(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="">Select cuisine type</option>
                      {cuisineOptions.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>
                          {cuisine}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addCuisine}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Restaurant Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
                      {formData.logo && isValidImageUrl(formData.logo) ? (
                        <img
                          src={getImageUrl(formData.logo)}
                          alt="Restaurant logo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              const icon = parent.querySelector('svg');
                              if (icon) icon.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <ImageIcon className={`h-10 w-10 text-gray-400 ${formData.logo && isValidImageUrl(formData.logo) ? 'hidden' : ''}`} />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{isUploadingLogo ? 'Uploading...' : formData.logo ? 'Change Logo' : 'Upload Logo'}</span>
                      </button>
                      {formData.logo && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => prev ? ({ ...prev, logo: '' }) : null);
                            if (logoInputRef.current) {
                              logoInputRef.current.value = '';
                            }
                          }}
                          className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                          <X className="h-4 w-4" />
                          <span>Remove Logo</span>
                        </button>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !formData) return;
                          
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            setErrorMessage('File size must be less than 5MB');
                            setShowError(true);
                            setTimeout(() => setShowError(false), 5000);
                            return;
                          }
                          
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            setErrorMessage('Please select an image file');
                            setShowError(true);
                            setTimeout(() => setShowError(false), 5000);
                            return;
                          }
                          
                          try {
                            setIsUploadingLogo(true);
                            setShowError(false);
                            const token = localStorage.getItem('token') || '';
                            const formDataObj = new FormData();
                            formDataObj.append('file', file);
                            
                            const headers: any = {};
                            if (token) headers['Authorization'] = `Bearer ${token}`;
                            
                            const res = await fetch('/api/uploads', {
                              method: 'POST',
                              headers,
                              body: formDataObj
                            });
                            
                            const json = await res.json();
                            
                            if (res.ok && json.url) {
                              // Update local state immediately
                              setFormData(prev => prev ? ({ ...prev, logo: json.url }) : null);
                              
                              // Save to database immediately
                              const updateRes = await fetch('/api/restaurant/settings', {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                                },
                                body: JSON.stringify({ logo: json.url })
                              });
                              
                              if (updateRes.ok) {
                                const updateData = await updateRes.json();
                                if (updateData.settings) {
                                  setFormData(updateData.settings);
                                }
                                setShowSuccess(true);
                                setTimeout(() => setShowSuccess(false), 3000);
                              } else {
                                const errorJson = await updateRes.json().catch(() => ({}));
                                throw new Error(errorJson.message || 'Failed to save logo');
                              }
                            } else {
                              throw new Error(json.message || 'Upload failed');
                            }
                          } catch (e: any) {
                            console.error('Logo upload error:', e);
                            setErrorMessage(e.message || 'Failed to upload logo. Please try again.');
                            setShowError(true);
                            setTimeout(() => setShowError(false), 5000);
                          } finally {
                            setIsUploadingLogo(false);
                            if (logoInputRef.current) {
                              logoInputRef.current.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Recommended size: 200x200px. Max file size: 5MB. Supported formats: JPG, PNG, WebP</p>
                </div>
              </motion.div>
            )}

            {/* Operating Hours Tab */}
            {activeTab === 'hours' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  {dayNames.map((day, index) => (
                    <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700">
                          {dayLabels[index]}
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.operatingHours?.[day as keyof typeof formData.operatingHours]?.isOpen || false}
                          onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </div>

                      {formData.operatingHours?.[day as keyof typeof formData.operatingHours]?.isOpen && (
                        <>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">From:</label>
                            <input
                              type="time"
                              value={formData.operatingHours?.[day as keyof typeof formData.operatingHours]?.open || '08:00'}
                              onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">To:</label>
                            <input
                              type="time"
                              value={formData.operatingHours?.[day as keyof typeof formData.operatingHours]?.close || '22:00'}
                              onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Delivery Settings Tab */}
            {activeTab === 'delivery' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Fee (₦) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.deliveryFee || 0}
                      onChange={(e) => handleInputChange('deliveryFee', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Set to 0 for free delivery</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Amount (₦) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.minimumOrder || 0}
                      onChange={(e) => handleInputChange('minimumOrder', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Delivery Time (minutes) *
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={formData.estimatedDeliveryTime || 30}
                      onChange={(e) => handleInputChange('estimatedDeliveryTime', parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="30"
                    />
                    <p className="text-xs text-gray-500 mt-1">Between 5-120 minutes</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Features & Payment Tab */}
            {activeTab === 'features' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Restaurant Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {featureOptions.map((feature) => (
                      <label key={feature} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.features?.includes(feature) || false}
                          onChange={() => toggleFeature(feature)}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {feature.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Accepted Payment Methods
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {paymentMethodOptions.map((method) => (
                      <label key={method} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.paymentMethods?.includes(method) || false}
                          onChange={() => togglePaymentMethod(method)}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {method.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-amber-50/80">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Auto payout (Paystack)</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          When enabled, your share is sent after you confirm a paid card order (not when payment first completes).
                          Uses the platform&apos;s Paystack balance — keep a funded float; settlements refill on delay (e.g. T+1).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('autoPayoutEnabled', !formData.autoPayoutEnabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                          !!formData.autoPayoutEnabled ? 'bg-brand-primary' : 'bg-gray-300'
                        }`}
                        aria-label="Toggle automatic payout"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            !!formData.autoPayoutEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-700">
                      Transfers use only the meal total (menu line items). Delivery fee and service charge are never sent to the restaurant; the platform keeps them.
                      Optional: RESTAURANT_AUTO_PAYOUT_RATIO (0–1) scales only that meal amount; default is 100%.
                      Minimum transfer ₦100.
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout account
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Used for manual payouts and automatic Paystack transfers. Select bank and account number, then verify to confirm account name.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Bank</label>
                      <select
                        value={formData.payoutBankCode || ''}
                        onChange={(e) => {
                          const opt = banks.find((b) => b.code === e.target.value);
                          setFormData((prev) => prev ? {
                            ...prev,
                            payoutBankCode: e.target.value,
                            payoutBankName: opt?.name ?? ''
                          } : null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-gray-900 text-sm"
                      >
                        <option value="">Select bank</option>
                        {banks.map((b) => (
                          <option key={b.code} value={b.code}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Account number</label>
                      <input
                        type="text"
                        value={formData.payoutAccountNumber || ''}
                        onChange={(e) => handleInputChange('payoutAccountNumber', e.target.value)}
                        placeholder="10 digits"
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const code = formData?.payoutBankCode?.trim();
                        const num = formData?.payoutAccountNumber?.trim();
                        if (!code || !num) {
                          setPayoutResolveError('Select bank and enter account number');
                          return;
                        }
                        setPayoutResolveError('');
                        setPayoutResolving(true);
                        try {
                          const res = await fetch(`/api/paystack/resolve-account?account_number=${encodeURIComponent(num)}&bank_code=${encodeURIComponent(code)}`);
                          const data = await res.json();
                          if (data.success && data.account_name && formData) {
                            setFormData((prev) => prev ? { ...prev, payoutAccountName: data.account_name } : null);
                          } else {
                            setPayoutResolveError(data.error || 'Could not verify account');
                          }
                        } catch {
                          setPayoutResolveError('Verification failed');
                        } finally {
                          setPayoutResolving(false);
                        }
                      }}
                      disabled={payoutResolving || !formData?.payoutBankCode || !formData?.payoutAccountNumber}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {payoutResolving ? 'Verifying…' : 'Verify account'}
                    </button>
                    {formData?.payoutAccountName && (
                      <span className="text-sm text-green-700">Account name: {formData.payoutAccountName}</span>
                    )}
                    {payoutResolveError && (
                      <span className="text-sm text-red-600">{payoutResolveError}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
         