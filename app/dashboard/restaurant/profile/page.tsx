'use client';

import { useState, useEffect, useRef } from 'react';
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
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { getImageUrl, isValidImageUrl } from '@/lib/image-utils';

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
  bannerImage: string;
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
  const [success, setSuccess] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

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
        
        // Parse operatingHours if it's a JSON string
        let operatingHoursObj = {};
        if (typeof p.operatingHours === 'string') {
          try {
            operatingHoursObj = JSON.parse(p.operatingHours);
          } catch (e) {
            console.error('Failed to parse operatingHours:', e);
          }
        } else if (typeof p.operatingHours === 'object' && p.operatingHours !== null) {
          operatingHoursObj = p.operatingHours;
        }
        
        const mapped: RestaurantProfile = {
          _id: p.id || p._id, // Use id from Prisma, fallback to _id
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
          businessHours: Object.keys(operatingHoursObj).map((d: any) => ({ 
            day: d[0].toUpperCase()+d.slice(1), 
            open: (operatingHoursObj as any)[d].open, 
            close: (operatingHoursObj as any)[d].close, 
            isOpen: (operatingHoursObj as any)[d].isOpen 
          })),
          images: [p.image].filter(Boolean),
          logo: (p.logo !== null && p.logo !== undefined && p.logo !== '') ? p.logo : '',
          bannerImage: p.bannerImage || '',
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
    
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token') || '';
      
      // Convert businessHours array to operatingHours object format
      const operatingHours: Record<string, { open: string; close: string; isOpen: boolean }> = {};
      if (profile.businessHours && Array.isArray(profile.businessHours)) {
        profile.businessHours.forEach((schedule) => {
          const dayKey = schedule.day.toLowerCase();
          operatingHours[dayKey] = {
            open: schedule.open || '09:00',
            close: schedule.close || '22:00',
            isOpen: schedule.isOpen
          };
        });
      }
      
      const body: any = {
        name: profile.name,
        description: profile.description,
        address: profile.address,
        phone: profile.phone,
        website: '',
        university: '',
        cuisine: typeof profile.cuisine === 'string' 
          ? profile.cuisine.split(',').map((s: string) => s.trim()).filter(Boolean)
          : profile.cuisine,
        logo: profile.logo || '',
        image: profile.images?.[0] || '',
        bannerImage: profile.images?.[1] || profile.images?.[0] || '',
        operatingHours: operatingHours
      };
      
      console.log('Saving profile with operatingHours:', operatingHours); // Debug log
      
      const res = await fetch('/api/restaurant/profile', { 
        method: 'PATCH', 
        headers: { 
          'Content-Type': 'application/json', 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        }, 
        body: JSON.stringify(body) 
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.message || 'Failed to save profile');
      }
      
      console.log('Profile saved successfully:', json.profile); // Debug log
      
      // Update local state with the response from server
      if (json.profile) {
        const p = json.profile;
        let operatingHoursObj = {};
        if (typeof p.operatingHours === 'string') {
          try {
            operatingHoursObj = JSON.parse(p.operatingHours);
          } catch (e) {
            console.error('Failed to parse operatingHours:', e);
          }
        } else if (typeof p.operatingHours === 'object' && p.operatingHours !== null) {
          operatingHoursObj = p.operatingHours;
        }
        
        const updatedProfile: RestaurantProfile = {
          _id: p.id || p._id,
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
          businessHours: Object.keys(operatingHoursObj).map((d: any) => ({ 
            day: d[0].toUpperCase()+d.slice(1), 
            open: (operatingHoursObj as any)[d].open, 
            close: (operatingHoursObj as any)[d].close, 
            isOpen: (operatingHoursObj as any)[d].isOpen 
          })),
          images: [p.image].filter(Boolean),
          logo: p.logo || '',
          bannerImage: p.bannerImage || '',
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
        setProfile(updatedProfile);
      }
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (e: any) {
      console.error('Error saving profile:', e);
      setError(e.message || 'Failed to save profile. Please try again.');
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reload profile to reset any unsaved changes
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/restaurant/profile', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const json = await res.json();
      if (res.ok && json.profile) {
        const p = json.profile;
        let operatingHoursObj = {};
        if (typeof p.operatingHours === 'string') {
          try {
            operatingHoursObj = JSON.parse(p.operatingHours);
          } catch (e) {
            console.error('Failed to parse operatingHours:', e);
          }
        } else if (typeof p.operatingHours === 'object' && p.operatingHours !== null) {
          operatingHoursObj = p.operatingHours;
        }
        
        const mapped: RestaurantProfile = {
          _id: p.id || p._id,
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
          businessHours: Object.keys(operatingHoursObj).map((d: any) => ({ 
            day: d[0].toUpperCase()+d.slice(1), 
            open: (operatingHoursObj as any)[d].open, 
            close: (operatingHoursObj as any)[d].close, 
            isOpen: (operatingHoursObj as any)[d].isOpen 
          })),
          images: [p.image].filter(Boolean),
          logo: (p.logo !== null && p.logo !== undefined && p.logo !== '') ? p.logo : '',
          bannerImage: p.bannerImage || '',
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
      }
    } catch (e) {
      console.error('Error reloading profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(profile, "This is the profile gotten from the database")
  }, [profile])

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
                  disabled={isSaving}
                  className={`flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
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
        
        {/* Success/Error Messages */}
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>{success}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>{error}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
        
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
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                  {isValidImageUrl(profile.logo) ? (
                    <img
                      src={getImageUrl(profile.logo)}
                      alt={`${profile.name} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <ImageIcon className={`h-12 w-12 text-gray-400 ${profile.logo && isValidImageUrl(profile.logo) ? 'hidden' : ''}`} />
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
                        onChange={(e) => isEditing && setProfile({ ...profile, name: e.target.value })}
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
                        onChange={(e) => isEditing && setProfile({ ...profile, cuisine: e.target.value })}
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
                        onChange={(e) => isEditing && setProfile({ ...profile, description: e.target.value })}
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
                        onChange={(e) => isEditing && setProfile({ ...profile, phone: e.target.value })}
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
                        onChange={(e) => isEditing && setProfile({ ...profile, email: e.target.value })}
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
                        onChange={(e) => isEditing && setProfile({ ...profile, address: e.target.value })}
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
                        onChange={(e) => isEditing && setProfile({ ...profile, city: e.target.value })}
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
                        onChange={(e) => isEditing && setProfile({ ...profile, state: e.target.value })}
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
                        onChange={(e) => isEditing && setProfile({ ...profile, zipCode: e.target.value })}
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
                    {profile.businessHours.map((schedule, index) => (
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
                              onChange={(e) => {
                                if (!isEditing) return;
                                const updatedHours = [...profile.businessHours];
                                updatedHours[index] = { ...updatedHours[index], isOpen: e.target.checked };
                                setProfile({ ...profile, businessHours: updatedHours });
                              }}
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
                              onChange={(e) => {
                                if (!isEditing) return;
                                const updatedHours = [...profile.businessHours];
                                updatedHours[index] = { ...updatedHours[index], open: e.target.value };
                                setProfile({ ...profile, businessHours: updatedHours });
                              }}
                              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:bg-gray-50 disabled:text-gray-700"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={schedule.close}
                              disabled={!isEditing}
                              onChange={(e) => {
                                if (!isEditing) return;
                                const updatedHours = [...profile.businessHours];
                                updatedHours[index] = { ...updatedHours[index], close: e.target.value };
                                setProfile({ ...profile, businessHours: updatedHours });
                              }}
                              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white disabled:bg-gray-50 disabled:text-gray-700"
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
                  {/* <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Restaurant Photos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profile.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden">
                            {isValidImageUrl(image) ? (
                              <img
                                src={getImageUrl(image)}
                                alt={`Restaurant photo ${index + 1}`}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
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
                  </div> */}

                  {/* Logo */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Restaurant Logo</h4>
                    <div className="space-y-4">
                      {/* Logo Preview */}
                      <div className="flex items-start space-x-4">
                        <div className="relative w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
                          {(logoPreview || (isValidImageUrl(profile.logo) && profile.logo)) ? (
                            <img
                              src={logoPreview || getImageUrl(profile.logo)}
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
                          <ImageIcon className={`h-12 w-12 text-gray-400 ${(logoPreview || (isValidImageUrl(profile.logo) && profile.logo)) ? 'hidden' : ''}`} />
                          {isUploadingLogo && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <div className="spinner border-white border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        
                        {isEditing && (
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Logo
                              </label>
                              <div className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  onClick={() => logoInputRef.current?.click()}
                                  disabled={isUploadingLogo}
                                  className={`px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center space-x-2 text-sm font-medium ${
                                    isUploadingLogo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                >
                                  <Upload className="h-4 w-4" />
                                  <span>{isUploadingLogo ? 'Uploading...' : selectedLogoFile ? 'Change File' : 'Choose File'}</span>
                                </button>
                                {selectedLogoFile && !isUploadingLogo && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLogoFile(null);
                                      setLogoPreview(null);
                                      if (logoInputRef.current) {
                                        logoInputRef.current.value = '';
                                      }
                                    }}
                                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                                  >
                                    <X className="h-4 w-4 inline mr-1" />
                                    Cancel
                                  </button>
                                )}
                              </div>
                              
                              {selectedLogoFile && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <ImageIcon className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm text-blue-900 font-medium">{selectedLogoFile.name}</span>
                                      <span className="text-xs text-blue-600">
                                        ({(selectedLogoFile.size / 1024 / 1024).toFixed(2)} MB)
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-blue-700 mt-1">Click "Upload Logo" to save this image</p>
                                </div>
                              )}
                              
                              <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) {
                                    setSelectedLogoFile(null);
                                    setLogoPreview(null);
                                    return;
                                  }
                                  
                                  // Validate file size (max 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    setError('File size must be less than 5MB');
                                    setTimeout(() => setError(''), 5000);
                                    return;
                                  }
                                  
                                  // Validate file type
                                  if (!file.type.startsWith('image/')) {
                                    setError('Please select an image file (JPG, PNG, WebP)');
                                    setTimeout(() => setError(''), 5000);
                                    return;
                                  }
                                  
                                  setSelectedLogoFile(file);
                                  setError('');
                                  
                                  // Create preview
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setLogoPreview(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              
                              {selectedLogoFile && !isUploadingLogo && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!selectedLogoFile || !profile) return;
                                    
                                    try {
                                      setIsUploadingLogo(true);
                                      setError('');
                                      setSuccess('');
                                      
                                      const token = localStorage.getItem('token') || '';
                                      const formData = new FormData();
                                      formData.append('file', selectedLogoFile);
                                      const headers: any = {};
                                      if (token) headers['Authorization'] = `Bearer ${token}`;
                                      
                                      // Step 1: Upload file
                                      const res = await fetch('/api/uploads', {
                                        method: 'POST',
                                        headers,
                                        body: formData
                                      });
                                      
                                      const json = await res.json();
                                      if (!res.ok || !json.url) {
                                        throw new Error(json.message || 'Upload failed');
                                      }
                                      
                                      // Step 2: Save to database
                                      const updateRes = await fetch('/api/restaurant/profile', {
                                        method: 'PATCH',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          ...(token ? { Authorization: `Bearer ${token}` } : {})
                                        },
                                        body: JSON.stringify({ logo: json.url })
                                      });
                                      
                                      if (!updateRes.ok) {
                                        const errorJson = await updateRes.json().catch(() => ({}));
                                        throw new Error(errorJson.message || errorJson.error || 'Failed to save logo');
                                      }
                                      
                                      const updateData = await updateRes.json();
                                      
                                      console.log('📥 Response from PATCH /api/restaurant/profile:', {
                                        'updateData.profile': updateData.profile,
                                        'updateData.profile.logo': updateData.profile?.logo,
                                        'updateData.warning': updateData.warning,
                                        'json.url (uploaded)': json.url
                                      });
                                      
                                      // Check for warning message (e.g., logo column doesn't exist)
                                      if (updateData.warning) {
                                        setError(updateData.warning);
                                        setTimeout(() => setError(''), 8000);
                                      }
                                      
                                      // Update local state with server response
                                      if (updateData.profile) {
                                        const p = updateData.profile;
                                        console.log('🔍 Processing profile response:', {
                                          'p.logo': p.logo,
                                          'p.logo type': typeof p.logo,
                                          'p.logo length': p.logo ? p.logo.length : 0,
                                          'p.id': p.id
                                        });
                                        let operatingHoursObj = {};
                                        if (typeof p.operatingHours === 'string') {
                                          try {
                                            operatingHoursObj = JSON.parse(p.operatingHours);
                                          } catch (e) {
                                            console.error('Failed to parse operatingHours:', e);
                                          }
                                        } else if (typeof p.operatingHours === 'object' && p.operatingHours !== null) {
                                          operatingHoursObj = p.operatingHours;
                                        }
                                        
                                        const updatedProfile: RestaurantProfile = {
                                          _id: p.id || p._id,
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
                                          businessHours: Object.keys(operatingHoursObj).map((d: any) => ({ 
                                            day: d[0].toUpperCase()+d.slice(1), 
                                            open: (operatingHoursObj as any)[d].open, 
                                            close: (operatingHoursObj as any)[d].close, 
                                            isOpen: (operatingHoursObj as any)[d].isOpen 
                                          })),
                                          images: [p.image].filter(Boolean),
                                          logo: (p.logo !== null && p.logo !== undefined && p.logo !== '') ? p.logo : '',
                                          bannerImage: p.bannerImage || '',
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
                                        setProfile(updatedProfile);
                                      }
                                      
                                      // Clear file selection and preview (logo will show from profile.logo now)
                                      setSelectedLogoFile(null);
                                      setLogoPreview(null);
                                      if (logoInputRef.current) {
                                        logoInputRef.current.value = '';
                                      }
                                      
                                      setSuccess('✅ Logo uploaded and saved successfully!');
                                      setTimeout(() => setSuccess(''), 3000);
                                      
                                      // Clear any errors
                                      setError('');
                                      
                                      // Reload profile to ensure logo is displayed
                                      setTimeout(async () => {
                                        try {
                                          const token = localStorage.getItem('token') || '';
                                          const res = await fetch('/api/restaurant/profile', { 
                                            headers: token ? { Authorization: `Bearer ${token}` } : {} 
                                          });
                                          const json = await res.json();
                                          if (res.ok && json.profile) {
                                            const p = json.profile;
                                            let operatingHoursObj = {};
                                            if (typeof p.operatingHours === 'string') {
                                              try {
                                                operatingHoursObj = JSON.parse(p.operatingHours);
                                              } catch (e) {
                                                console.error('Failed to parse operatingHours:', e);
                                              }
                                            } else if (typeof p.operatingHours === 'object' && p.operatingHours !== null) {
                                              operatingHoursObj = p.operatingHours;
                                            }
                                            
                                            const reloadedProfile: RestaurantProfile = {
                                              _id: p.id || p._id,
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
                                              businessHours: Object.keys(operatingHoursObj).map((d: any) => ({ 
                                                day: d[0].toUpperCase()+d.slice(1), 
                                                open: (operatingHoursObj as any)[d].open, 
                                                close: (operatingHoursObj as any)[d].close, 
                                                isOpen: (operatingHoursObj as any)[d].isOpen 
                                              })),
                                              images: [p.image].filter(Boolean),
                                              logo: (p.logo !== null && p.logo !== undefined && p.logo !== '') ? p.logo : '',
                                              bannerImage: p.bannerImage || '',
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
                                            setProfile(reloadedProfile);
                                          }
                                        } catch (reloadError) {
                                          console.error('Error reloading profile:', reloadError);
                                        }
                                      }, 500);
                                    } catch (e: any) {
                                      console.error('Logo upload error:', e);
                                      setError(e.message || 'Failed to upload logo. Please try again.');
                                      setTimeout(() => setError(''), 5000);
                                    } finally {
                                      setIsUploadingLogo(false);
                                    }
                                  }}
                                  className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Upload className="h-4 w-4" />
                                  <span>Upload Logo</span>
                                </button>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500">
                              Recommended size: 200x200px. Max file size: 5MB. Supported formats: JPG, PNG, WebP
                            </p>
                          </div>
                        )}
                        
                        {!isEditing && profile.logo && isValidImageUrl(profile.logo) && (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">Current Logo</p>
                            <p className="text-xs text-gray-500 mt-1">Click "Edit Profile" to change</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Cover Image</h4>
                    <p className="text-sm text-gray-600 mb-4">This image will be displayed as the restaurant's banner/cover on the student-facing pages.</p>
                    <div className="space-y-4">
                      {/* Cover Preview */}
                      <div className="flex flex-col space-y-4">
                        <div className="relative w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
                          {(coverPreview || (isValidImageUrl(profile.bannerImage) && profile.bannerImage)) ? (
                            <img
                              src={coverPreview || getImageUrl(profile.bannerImage)}
                              alt="Restaurant cover"
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
                          <ImageIcon className={`h-12 w-12 text-gray-400 ${(coverPreview || (isValidImageUrl(profile.bannerImage) && profile.bannerImage)) ? 'hidden' : ''}`} />
                          {isUploadingCover && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <div className="spinner border-white border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        
                        {isEditing && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Cover Image
                              </label>
                              <div className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  onClick={() => coverInputRef.current?.click()}
                                  disabled={isUploadingCover}
                                  className={`px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center space-x-2 text-sm font-medium ${
                                    isUploadingCover ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                >
                                  <Upload className="h-4 w-4" />
                                  <span>{isUploadingCover ? 'Uploading...' : selectedCoverFile ? 'Change File' : 'Choose File'}</span>
                                </button>
                                {selectedCoverFile && !isUploadingCover && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCoverFile(null);
                                      setCoverPreview(null);
                                      if (coverInputRef.current) {
                                        coverInputRef.current.value = '';
                                      }
                                    }}
                                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                                  >
                                    <X className="h-4 w-4 inline mr-1" />
                                    Cancel
                                  </button>
                                )}
                              </div>
                              
                              {selectedCoverFile && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <ImageIcon className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm text-blue-900 font-medium">{selectedCoverFile.name}</span>
                                      <span className="text-xs text-blue-600">
                                        ({(selectedCoverFile.size / 1024 / 1024).toFixed(2)} MB)
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-blue-700 mt-1">Click "Upload Cover Image" to save this image</p>
                                </div>
                              )}
                              
                              <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) {
                                    setSelectedCoverFile(null);
                                    setCoverPreview(null);
                                    return;
                                  }
                                  
                                  // Validate file size (max 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    setError('File size must be less than 5MB');
                                    setTimeout(() => setError(''), 5000);
                                    return;
                                  }
                                  
                                  // Validate file type
                                  if (!file.type.startsWith('image/')) {
                                    setError('Please select an image file (JPG, PNG, WebP)');
                                    setTimeout(() => setError(''), 5000);
                                    return;
                                  }
                                  
                                  setSelectedCoverFile(file);
                                  setError('');
                                  
                                  // Create preview
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setCoverPreview(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              
                              {selectedCoverFile && !isUploadingCover && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!selectedCoverFile || !profile) return;
                                    
                                    try {
                                      setIsUploadingCover(true);
                                      setError('');
                                      setSuccess('');
                                      
                                      const token = localStorage.getItem('token') || '';
                                      const formData = new FormData();
                                      formData.append('file', selectedCoverFile);
                                      const headers: any = {};
                                      if (token) headers['Authorization'] = `Bearer ${token}`;
                                      
                                      // Step 1: Upload file
                                      const res = await fetch('/api/uploads', {
                                        method: 'POST',
                                        headers,
                                        body: formData
                                      });
                                      
                                      const json = await res.json();
                                      if (!res.ok || !json.url) {
                                        throw new Error(json.message || 'Upload failed');
                                      }
                                      
                                      // Step 2: Save to database
                                      const updateRes = await fetch('/api/restaurant/profile', {
                                        method: 'PATCH',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          ...(token ? { Authorization: `Bearer ${token}` } : {})
                                        },
                                        body: JSON.stringify({ bannerImage: json.url })
                                      });
                                      
                                      if (!updateRes.ok) {
                                        const errorJson = await updateRes.json().catch(() => ({}));
                                        throw new Error(errorJson.message || errorJson.error || 'Failed to save cover image');
                                      }
                                      
                                      const updateData = await updateRes.json();
                                      
                                      // Update local state with server response
                                      if (updateData.profile) {
                                        setProfile(prev => prev ? { ...prev, bannerImage: updateData.profile.bannerImage || '' } : null);
                                      }
                                      
                                      // Clear file selection and preview
                                      setSelectedCoverFile(null);
                                      setCoverPreview(null);
                                      if (coverInputRef.current) {
                                        coverInputRef.current.value = '';
                                      }
                                      
                                      setSuccess('✅ Cover image uploaded and saved successfully!');
                                      setTimeout(() => setSuccess(''), 3000);
                                      setError('');
                                      
                                    } catch (e: any) {
                                      console.error('Cover image upload error:', e);
                                      setError(e.message || 'Failed to upload cover image. Please try again.');
                                      setTimeout(() => setError(''), 5000);
                                    } finally {
                                      setIsUploadingCover(false);
                                    }
                                  }}
                                  className="w-full mt-3 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Upload className="h-4 w-4" />
                                  <span>Upload Cover Image</span>
                                </button>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500">
                              Recommended size: 1200x400px (3:1 aspect ratio). Max file size: 5MB. Supported formats: JPG, PNG, WebP
                            </p>
                          </div>
                        )}
                        
                        {!isEditing && profile.bannerImage && isValidImageUrl(profile.bannerImage) && (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">Current Cover Image</p>
                            <p className="text-xs text-gray-500 mt-1">Click "Edit Profile" to change</p>
                          </div>
                        )}
                      </div>
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
