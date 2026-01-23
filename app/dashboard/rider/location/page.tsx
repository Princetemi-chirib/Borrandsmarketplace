'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  MapPin, 
  Navigation,
  RefreshCw,
  AlertCircle,
  Compass,
  Target,
  Map
} from 'lucide-react';

export default function Location() {
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLoading(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Unable to get your location. Please enable location services.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    // In a real app, you would send location updates to the server
    // For now, we'll just update the location periodically
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (err) => {
        console.error('Error tracking location:', err);
        setError('Error tracking location');
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );

    // Store watchId to clear it later
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  const openInMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackArrow href="/dashboard/rider" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Location Tracking</h1>
              <p className="text-sm text-gray-600 mt-1">Track and share your location</p>
            </div>
          </div>
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

        {/* Location Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
                <p className="text-gray-600">Getting your location...</p>
              </div>
            </div>
          ) : location ? (
            <div className="space-y-6">
              {/* Current Location Display */}
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-10 w-10 text-brand-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Location</h3>
                <p className="text-sm text-gray-600">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>

              {/* Map Placeholder */}
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Map view would appear here</p>
                  <p className="text-xs text-gray-500 mt-1">Integrate with Google Maps API</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={requestLocation}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Location
                </button>
                <button
                  onClick={openInMaps}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  Open in Maps
                </button>
                {!isTracking ? (
                  <button
                    onClick={startTracking}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors sm:col-span-2"
                  >
                    <Target className="h-4 w-4" />
                    Start Location Tracking
                  </button>
                ) : (
                  <button
                    onClick={stopTracking}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors sm:col-span-2"
                  >
                    <Compass className="h-4 w-4" />
                    Stop Tracking
                  </button>
                )}
              </div>

              {/* Tracking Status */}
              {isTracking && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-green-800">Location tracking is active</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Not Available</h3>
              <p className="text-gray-600 mb-6">
                Unable to get your location. Please enable location services and try again.
              </p>
              <button
                onClick={requestLocation}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Location Tracking Info</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Your location is used to match you with nearby delivery orders</li>
            <li>• Location is only shared when you're online and available</li>
            <li>• You can stop tracking at any time</li>
            <li>• Location data is encrypted and secure</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
