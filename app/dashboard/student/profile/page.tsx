'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import BackArrow from '@/components/ui/BackArrow';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  Camera,
  Bell,
  Shield,
  CreditCard,
  Heart,
  Settings,
  LogOut
} from 'lucide-react';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studentId: string;
  department: string;
  level: string;
  address: string;
  profileImage: string | null;
}

interface PreferencesData {
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newRestaurants: boolean;
    deliveryReminders: boolean;
  };
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  deliveryPreferences: {
    contactless: boolean;
    instructions: string;
  };
}

export default function Profile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'payment', name: 'Payment', icon: CreditCard }
  ];

  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    department: '',
    level: '',
    address: '',
    profileImage: null
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    notifications: {
      orderUpdates: true,
      promotions: false,
      newRestaurants: true,
      deliveryReminders: true
    },
    dietaryRestrictions: [],
    favoriteCuisines: [],
    deliveryPreferences: {
      contactless: true,
      instructions: ''
    }
  });

  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [originalPreferences, setOriginalPreferences] = useState<PreferencesData | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        return;
      }

      const response = await fetch('/api/students/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      if (data.success && data.profile) {
        const p = data.profile;
        
        // Split name into firstName and lastName
        const nameParts = (p.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Get first address or empty string
        const addresses = Array.isArray(p.addresses) ? p.addresses : [];
        const address = addresses.length > 0 ? addresses[0] : '';

        // Parse preferences with defaults
        const prefs = p.preferences || {};
        const parsedPreferences: PreferencesData = {
          notifications: {
            orderUpdates: prefs.notifications?.orderUpdates ?? true,
            promotions: prefs.notifications?.promotions ?? false,
            newRestaurants: prefs.notifications?.newRestaurants ?? true,
            deliveryReminders: prefs.notifications?.deliveryReminders ?? true
          },
          dietaryRestrictions: Array.isArray(prefs.dietaryRestrictions) ? prefs.dietaryRestrictions : [],
          favoriteCuisines: Array.isArray(prefs.favoriteCuisines) ? prefs.favoriteCuisines : [],
          deliveryPreferences: {
            contactless: prefs.deliveryPreferences?.contactless ?? true,
            instructions: prefs.deliveryPreferences?.instructions || ''
          }
        };

        const profileData: ProfileData = {
          firstName,
          lastName,
          email: p.email || '',
          phone: p.phone || '',
          studentId: p.studentId || '',
          department: p.department || '',
          level: p.level || '',
          address,
          profileImage: p.profileImage
        };

        setProfile(profileData);
        setOriginalProfile(profileData);
        setPreferences(parsedPreferences);
        setOriginalPreferences(parsedPreferences);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Not authenticated. Please log in.');
        return;
      }

      // Combine firstName and lastName into name
      const name = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim();

      // Prepare addresses array (use first address if provided)
      const addresses = profile.address.trim() ? [profile.address.trim()] : [];

      // Prepare update payload
      const updateData: any = {
        name,
        phone: profile.phone || undefined,
        department: profile.department || undefined,
        level: profile.level || undefined,
        addresses: addresses,
        preferences: preferences
      };

      const response = await fetch('/api/students/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Update original state
        setOriginalProfile(profile);
        setOriginalPreferences(preferences);
        // Refresh profile data
        await fetchProfile();
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile');
      toast.error(error.message || 'Failed to save profile');
      // Revert to original state on error
      if (originalProfile) setProfile(originalProfile);
      if (originalPreferences) setPreferences(originalPreferences);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) setProfile(originalProfile);
    if (originalPreferences) setPreferences(originalPreferences);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Image */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
          <button 
            className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center hover:bg-brand-accent transition-colors"
            disabled={!isEditing}
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.firstName} {profile.lastName}</h3>
          <p className="text-gray-600 dark:text-gray-400">{profile.studentId || 'No student ID'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {profile.department || 'No department'} {profile.department && profile.level ? '•' : ''} {profile.level || ''}
          </p>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
          <input
            type="text"
            value={profile.studentId}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
          <input
            type="text"
            value={profile.department}
            onChange={(e) => setProfile({...profile, department: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
          <input
            type="text"
            value={profile.level}
            onChange={(e) => setProfile({...profile, level: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-70"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({...profile, address: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-70"
            placeholder="Enter your address"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      {/* Notifications */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h4>
        <div className="space-y-3">
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications for {key.toLowerCase()}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      [key]: e.target.checked
                    }
                  })}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary disabled:opacity-50"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Dietary Restrictions</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free'].map((restriction) => (
            <label key={restriction} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.dietaryRestrictions.includes(restriction)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPreferences({
                      ...preferences,
                      dietaryRestrictions: [...preferences.dietaryRestrictions, restriction]
                    });
                  } else {
                    setPreferences({
                      ...preferences,
                      dietaryRestrictions: preferences.dietaryRestrictions.filter(r => r !== restriction)
                    });
                  }
                }}
                disabled={!isEditing}
                className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary disabled:opacity-50"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{restriction}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Favorite Cuisines */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Favorite Cuisines</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Nigerian', 'Italian', 'Asian', 'American', 'African', 'Mexican', 'Indian', 'Mediterranean'].map((cuisine) => (
            <label key={cuisine} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.favoriteCuisines.includes(cuisine)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPreferences({
                      ...preferences,
                      favoriteCuisines: [...preferences.favoriteCuisines, cuisine]
                    });
                  } else {
                    setPreferences({
                      ...preferences,
                      favoriteCuisines: preferences.favoriteCuisines.filter(c => c !== cuisine)
                    });
                  }
                }}
                disabled={!isEditing}
                className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary disabled:opacity-50"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{cuisine}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Password</h4>
        <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
          Change Password
        </button>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">SMS Authentication</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Receive codes via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" disabled />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary opacity-50"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Methods</h4>
        <div className="space-y-3">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500 dark:text-gray-400">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p className="text-sm">No payment methods saved</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Payment methods are managed during checkout</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Arrow */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-start">
            <BackArrow href="/dashboard/student" />
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="spinner h-4 w-4"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
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
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-brand-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {activeTab === 'personal' && renderPersonalInfo()}
              {activeTab === 'preferences' && renderPreferences()}
              {activeTab === 'security' && renderSecurity()}
              {activeTab === 'payment' && renderPayment()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
