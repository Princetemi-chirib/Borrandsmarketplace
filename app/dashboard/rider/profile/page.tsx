'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Phone, 
  MapPin, 
  Truck,
  Edit, 
  Save, 
  Camera,
  Shield,
  CreditCard,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface RiderProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleModel?: string;
  vehicleColor?: string;
  licenseNumber?: string;
  insuranceNumber?: string;
  profileImage?: string;
  currentAddress?: string;
  isOnline: boolean;
  isAvailable: boolean;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  totalDeliveries: number;
  totalEarnings: number;
}

export default function RiderProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [formData, setFormData] = useState<Partial<RiderProfile>>({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/riders/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      if (data.success) {
        setProfile(data.profile);
        setFormData(data.profile);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch('/api/riders/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      if (data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  if (isLoading && !profile) {
    return (
      <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error || 'Profile not found'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackArrow href="/dashboard/rider" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your rider profile</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(profile);
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-brand-primary" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-600">{profile.email}</p>
                {profile.isVerified && (
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Verified Rider</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-primary">{profile.totalDeliveries}</p>
                <p className="text-xs text-gray-600 mt-1">Total Deliveries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₦{profile.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">Total Earnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{profile.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-600 mt-1">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{profile.reviewCount}</p>
                <p className="text-xs text-gray-600 mt-1">Reviews</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                <p className="text-gray-900">{profile.university}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.currentAddress || ''}
                    onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.currentAddress || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                {isEditing ? (
                  <select
                    value={formData.vehicleType || ''}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="bicycle">Bicycle</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="car">Car</option>
                    <option value="walking">Walking</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{profile.vehicleType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.vehicleNumber || ''}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.vehicleNumber || 'Not set'}</p>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
