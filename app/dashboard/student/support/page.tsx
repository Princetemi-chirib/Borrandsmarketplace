'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import BackArrow from '@/components/ui/BackArrow';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

export default function Support() {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');

  const tabs = [
    { id: 'faq', name: 'FAQ', icon: HelpCircle },
    { id: 'contact', name: 'Contact Us', icon: MessageCircle },
    { id: 'tickets', name: 'My Tickets', icon: FileText }
  ];

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'To place an order, browse restaurants, select your desired items, add them to cart, and proceed to checkout. You can pay using various payment methods including cards and mobile money.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept various payment methods including credit/debit cards, mobile money (MTN, Airtel, Glo), bank transfers, and cash on delivery for select areas.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery times vary by restaurant and location. Typically, orders are delivered within 15-45 minutes. You can track your order in real-time through the app.'
    },
    {
      question: 'Can I cancel my order?',
      answer: 'You can cancel your order within 5 minutes of placing it. After that, please contact our support team for assistance.'
    },
    {
      question: 'What if my food arrives cold or incorrect?',
      answer: 'If your order is incorrect or arrives in poor condition, please contact us immediately. We\'ll work to resolve the issue and may offer a refund or replacement.'
    },
    {
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time through the "My Orders" section. You\'ll receive updates at each stage of preparation and delivery.'
    }
  ];

  const contactMethods = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageCircle,
      action: 'Start Chat',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Phone Support',
      description: 'Call us directly',
      icon: Phone,
      action: 'Call Now',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Email Support',
      description: 'Send us an email',
      icon: Mail,
      action: 'Send Email',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const tickets = [
    {
      id: 'TKT-001',
      subject: 'Order not delivered',
      status: 'open',
      category: 'Delivery Issue',
      createdAt: '2024-01-15 14:30',
      lastUpdate: '2024-01-15 16:45'
    },
    {
      id: 'TKT-002',
      subject: 'Payment failed',
      status: 'resolved',
      category: 'Payment Issue',
      createdAt: '2024-01-14 10:15',
      lastUpdate: '2024-01-14 11:30'
    },
    {
      id: 'TKT-003',
      subject: 'Wrong order received',
      status: 'in-progress',
      category: 'Order Issue',
      createdAt: '2024-01-13 19:20',
      lastUpdate: '2024-01-14 09:15'
    }
  ];

  const categories = [
    'Order Issue',
    'Payment Issue', 
    'Delivery Issue',
    'Account Issue',
    'Technical Issue',
    'Other'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Get help and contact our support team</p>
            </div>
          </div>
        </div>
      </div>

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
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                          {expandedFaq === index ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                        {expandedFaq === index && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                {/* Contact Methods */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Contact Methods</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contactMethods.map((method, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                      >
                        <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mb-3`}>
                          <method.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{method.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{method.description}</p>
                        <button className="w-full px-3 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors text-sm">
                          {method.action}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* New Ticket Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create New Support Ticket</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                      <input
                        type="text"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                      <textarea
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        rows={4}
                        placeholder="Please provide detailed information about your issue..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
                      <Send className="h-4 w-4" />
                      <span>Submit Ticket</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Support Tickets</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
                      <Plus className="h-4 w-4" />
                      <span>New Ticket</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {tickets.map((ticket, index) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm dark:hover:bg-gray-700/50 transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${getStatusColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{ticket.subject}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">#{ticket.id} • {ticket.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('-', ' ')}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Created {ticket.createdAt}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {ticket.lastUpdate}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {tickets.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No support tickets</h3>
                      <p className="text-gray-600 dark:text-gray-400">You haven't created any support tickets yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

