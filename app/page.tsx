'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Truck, 
  Store, 
  Users, 
  Star, 
  Clock, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Zap,
  Award,
  Heart,
  TrendingUp,
  Globe,
  Lock,
  Wifi,
  CreditCard,
  Gift,
  Calendar,
  MessageCircle,
  Download,
  Play,
  ChevronRight,
  ChevronLeft,
  Quote,
  UserCheck,
  Building,
  GraduationCap,
  Coffee,
  Pizza,
  ShoppingCart,
  Headphones,
  BookOpen,
  Camera,
  Music,
  Gamepad2
} from 'lucide-react';
import Logo from '../components/Logo';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('students');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: ShoppingBag,
      title: 'Easy Ordering',
      description: 'Browse menus, place orders, and track deliveries in real-time with our intuitive interface'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery by verified university riders within 30 minutes'
    },
    {
      icon: Store,
      title: 'Restaurant Management',
      description: 'Comprehensive tools to manage orders, inventory, and grow your business efficiently'
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'Built specifically for university communities and local businesses'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Multiple payment options with bank-grade security and fraud protection'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Optimized for mobile devices with native app-like experience'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support via chat, email, and phone'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Live order tracking and instant notifications via WhatsApp'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Students Served', icon: Users },
    { number: '150+', label: 'Restaurants', icon: Store },
    { number: '300+', label: 'Active Riders', icon: Truck },
    { number: '15+', label: 'Universities', icon: Building },
    { number: '50,000+', label: 'Orders Delivered', icon: ShoppingBag },
    { number: '4.9★', label: 'Average Rating', icon: Star }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      university: 'University of Lagos',
      avatar: '/images/avatar1.jpg',
      content: 'Borrands has completely transformed my campus dining experience! The real-time tracking feature is amazing - I always know exactly when my food will arrive. The variety of restaurants and the seamless payment process make ordering so convenient.',
      rating: 5,
      orderCount: 45
    },
    {
      name: 'Michael Chen',
      role: 'Restaurant Owner',
      university: 'Covenant University',
      avatar: '/images/avatar2.jpg',
      content: 'Since joining Borrands, our sales have increased by 300%! The inventory management system is fantastic, and the analytics help us understand our customers better. The platform is incredibly user-friendly.',
      rating: 5,
      orderCount: 1200
    },
    {
      name: 'David Okafor',
      role: 'Rider',
      university: 'University of Ibadan',
      avatar: '/images/avatar3.jpg',
      content: 'I love being a Borrands rider! The app is intuitive, the earnings are great, and I get to help students while earning. The real-time navigation and order management make deliveries smooth and efficient.',
      rating: 5,
      orderCount: 89
    },
    {
      name: 'Fatima Hassan',
      role: 'Student',
      university: 'Ahmadu Bello University',
      avatar: '/images/avatar4.jpg',
      content: 'The loyalty program is fantastic! I\'ve earned so many rewards just by ordering regularly. The customer support team is always helpful, and the food quality is consistently excellent.',
      rating: 5,
      orderCount: 67
    },
    {
      name: 'James Wilson',
      role: 'Restaurant Manager',
      university: 'University of Nigeria',
      avatar: '/images/avatar5.jpg',
      content: 'Managing our restaurant through Borrands has been a game-changer. The order management system is robust, and the integration with our existing POS system was seamless.',
      rating: 5,
      orderCount: 890
    }
  ];

  const universities = [
    'Baze University', 'Veritas University'
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Browse & Order',
      description: 'Explore hundreds of restaurants, cafes, and food vendors on campus. Filter by cuisine, rating, or delivery time.',
      icon: ShoppingBag,
      color: 'from-blue-500 to-purple-600'
    },
    {
      step: '02',
      title: 'Track Your Order',
      description: 'Watch your order being prepared and delivered in real-time. Get instant updates via WhatsApp notifications.',
      icon: Truck,
      color: 'from-green-500 to-teal-600'
    },
    {
      step: '03',
      title: 'Enjoy & Rate',
      description: 'Receive your order and enjoy! Rate your experience to help other students and earn loyalty points.',
      icon: Star,
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const benefits = [
    {
      title: 'For Students',
      items: [
        'Browse 150+ restaurants and cafes',
        'Real-time order tracking',
        'Multiple payment options',
        'Loyalty rewards program',
        '24/7 customer support',
        'Campus-specific promotions'
      ],
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'For Restaurants',
      items: [
        'Easy order management',
        'Inventory tracking system',
        'Analytics and insights',
        'Marketing tools',
        'Payment processing',
        'Customer feedback system'
      ],
      icon: Store,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'For Riders',
      items: [
        'Flexible earning opportunities',
        'Real-time navigation',
        'Order management tools',
        'Earnings tracking',
        'Support system',
        'Performance bonuses'
      ],
      icon: Truck,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const faqs = [
    {
      question: 'How do I place my first order?',
      answer: 'Simply download the app, create an account, browse restaurants, select your items, and checkout. Payment can be made via card, bank transfer, or mobile money.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Most orders are delivered within 20-30 minutes. You can track your order in real-time and get updates via WhatsApp notifications.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, bank transfers, mobile money (MTN, Airtel, Glo), and cash on delivery for select orders.'
    },
    {
      question: 'How do I become a rider?',
      answer: 'Apply through our rider portal, complete the verification process, attend orientation, and start earning by delivering orders to students on campus.'
    },
    {
      question: 'Can restaurants join the platform?',
      answer: 'Yes! We welcome all campus restaurants and food vendors. Contact our business development team to get started with onboarding.'
    },
    {
      question: 'Is there a loyalty program?',
      answer: 'Yes! Earn points with every order, unlock rewards, and enjoy exclusive discounts. The more you order, the more you save!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white">
      {/* Navigation */}
      <nav className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-3">
                <Link href="/marketplace" className="text-brand-primary hover:text-brand-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">Marketplace</Link>
                <Link href="#features" className="text-gray-700 hover:text-brand-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</Link>
                <Link href="#how-it-works" className="text-gray-700 hover:text-brand-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">How it Works</Link>
                <Link href="#testimonials" className="text-gray-700 hover:text-brand-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Testimonials</Link>
                <Link href="#faq" className="text-gray-700 hover:text-brand-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">FAQ</Link>
                <Link href="/auth/login" className="text-brand-primary hover:text-brand-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                <Link href="/auth/register" className="bg-brand-accent hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors">Get Started</Link>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <Link href="/auth/login" className="text-brand-primary hover:text-brand-accent px-2 py-1 rounded text-sm font-medium transition-colors">Login</Link>
              <Link href="/auth/register" className="bg-brand-accent hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium shadow-sm transition-colors">Start</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Enhanced gradient blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center rounded-full bg-brand-primary/10 text-brand-primary px-3 py-1 text-xs font-semibold mb-4 animate-brand-pulse">
                <Globe className="h-3 w-3 mr-1" />
                Trusted by 15+ Universities
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Food. Commerce. Community.
                <span className="block text-brand-accent font-bold"> All in one campus app.</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl">
                Borrands connects students, restaurants and riders with real-time ordering, seamless delivery and campus-focused tools. Join 10,000+ students already enjoying the best campus dining experience.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/marketplace" className="bg-brand-primary hover:bg-indigo-800 text-white px-4 sm:px-6 py-3 rounded-lg text-sm sm:text-base font-semibold flex items-center justify-center shadow-md transition-all hover:scale-105">
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link href="/auth/register" className="bg-brand-accent hover:bg-red-600 text-white px-4 sm:px-6 py-3 rounded-lg text-sm sm:text-base font-semibold flex items-center justify-center shadow-md transition-all hover:scale-105">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link href="#features" className="border border-gray-300 hover:border-brand-primary hover:text-brand-primary text-gray-700 px-4 sm:px-6 py-3 rounded-lg text-sm sm:text-base font-semibold flex items-center justify-center bg-white/70 backdrop-blur transition-all hover:scale-105">
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Watch Demo
                </Link>
              </div>

              {/* Enhanced trust indicators */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {['Secure Payments','Fast Delivery','Campus Verified'].map((t, i) => (
                  <div key={t} className="flex items-center space-x-2">
                    <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${i===0?'text-green-600':i===1?'text-brand-accent':'text-brand-primary'}`} />
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">{t}</span>
                  </div>
                ))}
              </div>

              {/* Download badges */}
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Download app:</span>
                </div>
                <div className="flex space-x-2">
                  <div className="bg-black text-white px-2 sm:px-3 py-1 rounded text-xs font-medium">App Store</div>
                  <div className="bg-black text-white px-2 sm:px-3 py-1 rounded text-xs font-medium">Google Play</div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Hero Art */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                <Image src="/image0.jpg" alt="Borrands campus delivery" width={1200} height={900} className="object-cover w-full h-full" priority />
                
                {/* Enhanced floating cards */}
            <motion.div
                  initial={{ y: 10, opacity: 0 }} 
                  animate={{ y: -10, opacity: 1 }} 
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3 }} 
                  className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/95 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100"
                >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                      <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-brand-primary" />
                        </div>
                        <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">Order on the way</p>
                      <p className="text-xs text-gray-500">ETA 12 mins</p>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-brand-primary h-1 rounded-full w-3/4"></div>
                        </div>
                      </div>
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ y: -8, opacity: 0 }} 
                  animate={{ y: 8, opacity: 1 }} 
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 4 }} 
                  className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white/95 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100"
                >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-accent/10 flex items-center justify-center">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 text-brand-accent" />
                        </div>
                        <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">4.9 average</p>
                      <p className="text-xs text-gray-500">Student ratings</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-2 w-2 sm:h-3 sm:w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                        </div>
                      </div>
                    </div>
                </motion.div>

                {/* New floating card */}
                <motion.div 
                  initial={{ x: -10, opacity: 0 }} 
                  animate={{ x: 10, opacity: 1 }} 
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 5 }} 
                  className="absolute top-1/2 left-2 sm:left-4 bg-white/95 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Loyalty Points</p>
                      <p className="text-xs text-gray-500">+50 earned</p>
                </div>
              </div>
            </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-brand-primary to-brand-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-red-500 drop-shadow-lg">Trusted by Campus Communities</h2>
            <p className="text-lg sm:text-xl text-blue-400 drop-shadow-md">Join thousands of students, restaurants, and riders</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label} 
                initial={{ opacity: 0, y: 10 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-white/30 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 drop-shadow-md" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 text-red-500 drop-shadow-lg">{stat.number}</div>
                <div className="text-blue-400 text-xs sm:text-sm font-semibold drop-shadow-md">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Feature Grid */}
      <section id="features" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center rounded-full bg-brand-primary/10 text-brand-primary px-3 py-1 text-sm font-semibold mb-4">
              <Zap className="h-4 w-4 mr-1" />
              Powerful Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to run campus commerce</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-base sm:text-lg">Powerful tools for students, restaurants and riders with a clean, modern experience designed for university communities.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.4, delay: index * 0.05 }} 
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-brand-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Registration CTA */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 px-3 py-1 text-sm font-semibold mb-4">
                  <Store className="h-4 w-4 mr-1" />
                  For Restaurant Owners
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Grow Your Business with Borrands
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Join our platform and start serving thousands of hungry students. Get access to our powerful restaurant management tools, real-time order tracking, and dedicated support team.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Easy menu management and inventory control</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Real-time order notifications and tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Analytics and business insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Dedicated support and onboarding</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/auth/register-restaurant" 
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors hover:scale-105"
                  >
                    <Store className="w-5 h-5 mr-2" />
                    Register Your Restaurant
                  </Link>
                  <Link 
                    href="/dashboard/restaurant" 
                    className="border border-red-300 text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                  >
                    View Demo Dashboard
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-red-100 to-red-100 rounded-2xl p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Store className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Dashboard</h3>
                    <div className="space-y-3 text-left">
                                             <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                         <span className="text-gray-700">Today's Orders</span>
                         <span className="font-bold text-red-600">24</span>
                       </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Revenue</span>
                        <span className="font-bold text-green-600">₦45,200</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Rating</span>
                        <span className="font-bold text-yellow-600">4.8 ★</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Borrands Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Simple, fast, and reliable - get your favorite food delivered to your doorstep in just 3 easy steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div 
                key={step.step} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-100 z-0"></div>
                )}
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-xl relative z-10`}>
                  {step.step}
              </div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-gray-600" />
            </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
              </div>
            </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Benefits for Everyone</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Whether you're a student, restaurant owner, or rider, Borrands has something special for you</p>
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={benefit.title} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-6`}>
                  <benefit.icon className="h-8 w-8 text-white" />
            </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{benefit.title}</h3>
                <ul className="space-y-3">
                  {benefit.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Available at Leading Universities</h2>
            <p className="text-gray-600">Join students from top universities across Nigeria</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {universities.map((university, index) => (
              <motion.div
                key={university} 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:scale-105"
              >
                                 <div className="relative h-32 bg-gradient-to-br from-brand-primary to-brand-accent">
                   <Image 
                     src="/images/1.jpg" 
                     alt={university}
                     fill
                     className="object-cover"
                   />
                   <div className="absolute inset-0 bg-black/20"></div>
                 </div>
                                 <div className="p-4">
                   <p className="text-sm font-semibold text-gray-900 text-center">{university}</p>
                 </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved on campus</h2>
            <p className="text-gray-600 text-lg">What our community says about Borrands</p>
          </div>

          <div className="relative">
            <div className="flex overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: currentTestimonial === index ? 1 : 0, x: currentTestimonial === index ? 0 : 100 }}
                  transition={{ duration: 0.5 }}
                  className={`w-full flex-shrink-0 ${currentTestimonial === index ? 'block' : 'hidden'}`}
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
                      <div className="flex justify-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                      <Quote className="h-12 w-12 text-gray-300 mx-auto mb-6" />
                      <p className="text-lg text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full flex items-center justify-center text-white font-semibold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div className="text-left">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.university}</div>
                          <div className="text-xs text-gray-400">{testimonial.orderCount} orders completed</div>
                        </div>
                      </div>
                    </div>
                </div>
                </motion.div>
              ))}
            </div>
            
            {/* Navigation arrows */}
            <button 
              onClick={() => setCurrentTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button 
              onClick={() => setCurrentTestimonial(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
            
            {/* Dots indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentTestimonial === index ? 'bg-brand-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Everything you need to know about Borrands</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA */}
      <section className="py-20 bg-gradient-to-br from-white to-brand-accent/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to transform your campus experience?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Join thousands of students, restaurants, and riders who are already enjoying the best campus marketplace experience.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="inline-flex items-center bg-brand-accent hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-md transition-all hover:scale-105">
                Create your account
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
              <Link href="/auth/login" className="inline-flex items-center border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105">
                Sign in
          </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">No credit card required • Free to join • Start ordering in minutes</p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-brand-accent mb-4">Borrands Marketplace</h3>
              <p className="text-gray-400 mb-6 max-w-md">Connecting university communities through food delivery and marketplace services. Empowering students, restaurants, and riders with innovative technology.</p>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Browse Restaurants</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Track Orders</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Order History</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Loyalty Program</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Restaurants</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Join Platform</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Manage Orders</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Marketing Tools</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Lagos, Nigeria</li>
                  <li className="flex items-center"><Phone className="h-4 w-4 mr-2" /> +234 123 456 7890</li>
                  <li className="flex items-center"><Mail className="h-4 w-4 mr-2" /> support@borrands.com</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Download App</h4>
                <div className="space-y-2">
                  <div className="bg-black text-white px-4 py-2 rounded text-sm font-medium inline-block">App Store</div>
                  <div className="bg-black text-white px-4 py-2 rounded text-sm font-medium inline-block">Google Play</div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Borrands Marketplace. All rights reserved. | Built with  for university communities</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


