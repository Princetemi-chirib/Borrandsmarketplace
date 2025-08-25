'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  ShoppingBag, 
  Store, 
  Truck, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  User,
  BarChart3,
  Package,
  MapPin,
  CreditCard,
  FileText,
  HelpCircle
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
}

const navigationItems = {
  student: [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Browse Restaurants', href: '/dashboard/student/restaurants', icon: Store },
    { name: 'My Orders', href: '/dashboard/student/orders', icon: ShoppingBag },
    { name: 'Order History', href: '/dashboard/student/history', icon: FileText },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Support', href: '/dashboard/student/support', icon: HelpCircle },
  ],
  restaurant: [
    { name: 'Dashboard', href: '/dashboard/restaurant', icon: Home },
    { name: 'Orders', href: '/dashboard/restaurant/orders', icon: ShoppingBag },
    { name: 'Menu Management', href: '/dashboard/restaurant/menu', icon: Store },
    { name: 'Inventory', href: '/dashboard/restaurant/inventory', icon: Package },
    { name: 'Analytics', href: '/dashboard/restaurant/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/dashboard/restaurant/profile', icon: User },
    { name: 'Settings', href: '/dashboard/restaurant/settings', icon: Settings },
  ],
  rider: [
    { name: 'Dashboard', href: '/dashboard/rider', icon: Home },
    { name: 'Available Deliveries', href: '/dashboard/rider/deliveries', icon: Truck },
    { name: 'My Deliveries', href: '/dashboard/rider/my-deliveries', icon: Package },
    { name: 'Earnings', href: '/dashboard/rider/earnings', icon: CreditCard },
    { name: 'Location', href: '/dashboard/rider/location', icon: MapPin },
    { name: 'Profile', href: '/dashboard/rider/profile', icon: User },
    { name: 'Support', href: '/dashboard/rider/support', icon: HelpCircle },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Restaurants', href: '/dashboard/admin/restaurants', icon: Store },
    { name: 'Riders', href: '/dashboard/admin/riders', icon: Truck },
    { name: 'Orders', href: '/dashboard/admin/orders', icon: ShoppingBag },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
};

export default function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const navigation = navigationItems[userRole as keyof typeof navigationItems] || [];

  useEffect(() => {
    // Fetch notifications count
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-primary-600">
            University Marketplace
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userRole}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="hidden md:block">{userName}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
