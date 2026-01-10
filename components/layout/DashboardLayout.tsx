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
  HelpCircle,
  Heart,
  Star,
  Clock
} from 'lucide-react';
import Logo from '../Logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
}

const navigationItems = {
  student: [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Restaurants', href: '/dashboard/student/restaurants', icon: Store },
    { name: 'Favorites', href: '/dashboard/student/favorites', icon: Heart },
    { name: 'Orders', href: '/dashboard/student/orders', icon: ShoppingBag },
    { name: 'Reviews', href: '/dashboard/student/reviews', icon: Star },
    { name: 'History', href: '/dashboard/student/history', icon: Clock },
    { name: 'Support', href: '/dashboard/student/support', icon: HelpCircle },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigation = navigationItems[userRole as keyof typeof navigationItems] || [];

  useEffect(() => {
    // Fetch notifications count based on user role
    const fetchNotifications = async () => {
      try {
        // Only fetch notifications for roles that have endpoints
        if (userRole !== 'restaurant') {
          // Skip notification fetching for non-restaurant roles until endpoints are implemented
          return;
        }
        
        const response = await fetch('/api/notifications/count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.count);
        } else if (response.status === 401) {
          // Unauthorized - token might be invalid
          console.warn('Unauthorized notification fetch - token may be invalid');
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    // Poll every 30 seconds for restaurant role
    const interval = userRole === 'restaurant' ? setInterval(fetchNotifications, 30000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [userRole]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown') && !target.closest('.user-menu-dropdown')) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
      >
        {/* Logo Section - Optimized for mobile */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Logo size="sm" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Improved mobile spacing */}
        <nav className="mt-2 px-3 pb-24 overflow-y-auto h-full">
          <div className="space-y-1 pt-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section - Fixed positioning and better mobile design */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {userRole}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation - Fixed header */}
        <div className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Notifications */}
              <div className="relative notification-dropdown">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications > 0 ? (
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">Order Update</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Your order #ORD-123 has been picked up</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">Delivery Complete</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Your order has been delivered successfully</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      {notifications > 0 && (
                        <div className="p-3 border-t border-gray-200">
                          <button className="w-full text-sm text-brand-primary hover:text-brand-accent font-medium">
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User menu */}
              <div className="relative user-menu-dropdown">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block font-medium">{userName}</span>
                </button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href={`/dashboard/${userRole}/profile`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile
                        </Link>
                        <Link
                          href={`/dashboard/${userRole}/settings`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </Link>
                        <Link
                          href={`/dashboard/${userRole}/support`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <HelpCircle className="h-4 w-4 mr-3" />
                          Support
                        </Link>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Page content - Optimized padding for mobile, with top margin for fixed header */}
        <main className="pt-20 pb-3 sm:pt-20 sm:pb-4">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


