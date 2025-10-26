'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Upload,
  Star,
  Award,
  Calendar,
  Globe,
  CreditCard,
  Bell,
  Shield,
  Image as ImageIcon,
  Plus,
  Trash2,
  Settings
} from 'lucide-react';

interface RestaurantProfile {
  _id: string;
  name: string;
  description: string;
  cuisine: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  businessHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  images: string[];
  logo: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  deliveryRadius: number;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  paymentMethods: string[];
  features: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function RestaurantProfile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [error, setError] = useState<string>('');

  const tabs: Array<{ id: string; label: string; icon: any }> = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'delivery', label: 'Delivery Settings', icon: MapPin },
    { id: 'media', label: 'Photos & Media', icon: ImageIcon },
    { id: 'social', label: 'Social Media', icon: Globe },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch {}

    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('token') || '';
        const res = await fetch('/api/restaurant/profile', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to load profile');
        const p = json.profile;
        const mapped: RestaurantProfile = {
          _id: p._id,
          name: p.name || '',
          description: p.description || '',
          cuisine: Array.isArray(p.cuisine) ? p.cuisine.join(', ') : (p.cuisine || ''),
          phone: p.phone || '',
          email: (p as any).email || '',
          address: p.address || '',
          city: '',
          state: '',
          zipCode: '',
          coordinates: { lat: 0, lng: 0 },
          businessHours: Object.keys(p.operatingHours || {}).map((d: any) => ({ day: d[0].toUpperCase()+d.slice(1), open: p.operatingHours[d].open, close: p.operatingHours[d].close, isOpen: p.operatingHours[d].isOpen })),
          images: [p.image, p.bannerImage].filter(Boolean),
          logo: p.image || '',
          rating: p.rating || 0,
          reviewCount: p.reviewCount || 0,
          isVerified: p.isApproved || false,
          deliveryRadius: 0,
          deliveryFee: p.deliveryFee || 0,
          minimumOrder: p.minimumOrder || 0,
          estimatedDeliveryTime: p.estimatedDeliveryTime || 0,
          paymentMethods: p.paymentMethods || [],
          features: p.features || [],
          socialMedia: {},
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        };
        setProfile(mapped);
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile');
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    try {
      const token = localStorage.getItem('token') || '';
      const body: any = {
        name: profile.name,
        description: profile.description,
        address: profile.address,
        phone: profile.phone,
        website: '',
        university: '',
        cuisine: profile.cuisine.split(',').map(s => s.trim()).filter(Boolean),
        image: profile.logo,
        bannerImage: profile.images?.[0] || ''
      };
      const res = await fetch('/api/restaurant/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token? { Authorization: `Bearer ${token}` }: {}) }, body: JSON.stringify(body) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Failed to save');
      }
      setIsEditing(false);
    } catch (e) {
      // optionally show error toast
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any unsaved changes
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

  if (!profile) {
    return (
      <DashboardLayout userRole="restaurant" userName={user?.name || 'Restaurant'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
            <p className="text-gray-600">Unable to load restaurant profile</p>
          </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
              <p className="text-gray-600">Manage your restaurant information and settings</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              {/* Restaurant Logo and Basic Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-600">{profile.cuisine}</p>
                <div className="flex items-center justify-center mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium text-gray-900">{profile.rating}</span>
                  <span className="ml-1 text-sm text-gray-600">({profile.reviewCount} reviews)</span>
                </div>
                {profile.isVerified && (
                  <div className="flex items-center justify-center mt-2">
                    <Award className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Verified</span>
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab: { id: string; label: string; icon: any }) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brand-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {/* Basic Information */}
              {activeTab === 'basic' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuisine Type
                      </label>
                      <input
                        type="text"
                        value={profile.cuisine}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={profile.description}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={profile.address}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={profile.city}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={profile.state}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={profile.zipCode}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Business Hours */}
              {activeTab === 'hours' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Hours</h3>
                  <div className="space-y-4">
                    {profile.businessHours.map((schedule) => (
                      <div key={schedule.day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 text-sm font-medium text-gray-900">
                            {schedule.day}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={schedule.isOpen}
                              disabled={!isEditing}
                              className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-600">Open</span>
                          </div>
                        </div>
                        {schedule.isOpen && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={schedule.open}
                              disabled={!isEditing}
                              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-50"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={schedule.close}
                              disabled={!isEditing}
                              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-50"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Settings */}
              {activeTab === 'delivery' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Radius (km)
                      </label>
                      <input
                        type="number"
                        value={profile.deliveryRadius}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Fee (₦)
                      </label>
                      <input
                        type="number"
                        value={profile.deliveryFee}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order (₦)
                      </label>
                      <input
                        type="number"
                        value={profile.minimumOrder}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Delivery Time (minutes)
                      </label>
                      <input
                        type="number"
                        value={profile.estimatedDeliveryTime}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Payment Methods</h4>
                    <div className="space-y-2">
                      {profile.paymentMethods.map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            defaultChecked
                            disabled={!isEditing}
                            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Restaurant Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            defaultChecked
                            disabled={!isEditing}
                            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Photos & Media */}
              {activeTab === 'media' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Photos & Media</h3>
                  
                  {/* Restaurant Images */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Restaurant Photos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profile.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden">
                            <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          </div>
                          {isEditing && (
                            <button className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          onClick={() => setShowImageUpload(true)}
                          className="aspect-w-16 aspect-h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                        >
                          <div className="text-center">
                            <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-600">Add Photo</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Logo */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Restaurant Logo</h4>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      {isEditing && (
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Upload className="h-4 w-4 mr-2 inline" />
                          Upload New Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media */}
              {activeTab === 'social' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Media</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={profile.socialMedia.facebook || ''}
                        disabled={!isEditing}
                        placeholder="https://facebook.com/yourpage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={profile.socialMedia.instagram || ''}
                        disabled={!isEditing}
                        placeholder="https://instagram.com/yourpage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter URL
                      </label>
                      <input
                        type="url"
                        value={profile.socialMedia.twitter || ''}
                        disabled={!isEditing}
                        placeholder="https://twitter.com/yourpage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Account Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Created
                          </label>
                          <p className="text-sm text-gray-600">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Updated
                          </label>
                          <p className="text-sm text-gray-600">
                            {new Date(profile.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Security</h4>
                      <div className="space-y-3">
                        <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Change Password</p>
                              <p className="text-sm text-gray-600">Update your account password</p>
                            </div>
                            <Edit className="h-4 w-4 text-gray-400" />
                          </div>
                        </button>
                        <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-600">Add extra security to your account</p>
                            </div>
                            <Shield className="h-4 w-4 text-gray-400" />
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h4 className="text-md font-medium text-red-900 mb-2">Danger Zone</h4>
                      <p className="text-sm text-red-700 mb-4">
                        These actions are irreversible. Please proceed with caution.
                      </p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete Restaurant Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
