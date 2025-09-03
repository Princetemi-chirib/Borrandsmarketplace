'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'payment', name: 'Payment', icon: CreditCard }
  ];

  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    phone: '+234 801 234 5678',
    studentId: '2021001234',
    department: 'Computer Science',
    level: '300 Level',
    address: 'Block A, Room 205, University Campus',
    dateOfBirth: '1999-05-15',
    profileImage: '/images/profile.jpg'
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      orderUpdates: true,
      promotions: false,
      newRestaurants: true,
      deliveryReminders: true
    },
    dietaryRestrictions: ['Vegetarian'],
    favoriteCuisines: ['Nigerian', 'Italian', 'Asian'],
    deliveryPreferences: {
      contactless: true,
      instructions: 'Please call when arriving'
    }
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Image */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center hover:bg-brand-accent transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{profile.firstName} {profile.lastName}</h3>
          <p className="text-gray-600">{profile.studentId}</p>
          <p className="text-sm text-gray-500">{profile.department} • {profile.level}</p>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={profile.dateOfBirth}
            onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
          <input
            type="text"
            value={profile.studentId}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({...profile, address: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-50"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      {/* Notifications */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h4>
        <div className="space-y-3">
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-xs text-gray-500">Receive notifications for {key.toLowerCase()}</p>
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
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Dietary Restrictions</h4>
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
                className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-700">{restriction}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Favorite Cuisines */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Favorite Cuisines</h4>
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
                className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-700">{cuisine}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Password</h4>
        <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
          Change Password
        </button>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">SMS Authentication</p>
            <p className="text-xs text-gray-500">Receive codes via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-6 bg-blue-600 rounded"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Visa ending in 1234</p>
                <p className="text-xs text-gray-500">Expires 12/25</p>
              </div>
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
          </div>
          <button className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors">
            + Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Arrow */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-start">
            <BackArrow href="/dashboard/student" />
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-brand-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

