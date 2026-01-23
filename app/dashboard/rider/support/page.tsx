'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
  AlertCircle
} from 'lucide-react';

export default function Support() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const tabs = [
    { id: 'faq', name: 'FAQ', icon: HelpCircle },
    { id: 'contact', name: 'Contact Us', icon: MessageCircle },
    { id: 'tickets', name: 'My Tickets', icon: FileText }
  ];

  const faqs = [
    {
      question: 'How do I accept a delivery order?',
      answer: 'Go to the "Available Deliveries" page, review the order details, and click "Accept Delivery". Make sure you are online and available before accepting orders.'
    },
    {
      question: 'How do I update delivery status?',
      answer: 'Once you accept an order, go to "My Deliveries" page. You can mark orders as "Picked Up" when you collect from the restaurant, and "Delivered" when you complete the delivery.'
    },
    {
      question: 'How are my earnings calculated?',
      answer: 'You earn the delivery fee for each completed order. Your total earnings are displayed in the Earnings page, where you can view earnings by day, week, month, or all time.'
    },
    {
      question: 'What if I can\'t complete a delivery?',
      answer: 'If you encounter any issues, contact support immediately. Do not mark the order as delivered if you haven\'t completed it. Support will help resolve the situation.'
    },
    {
      question: 'How do I track my location?',
      answer: 'Go to the Location page and enable location tracking. This helps match you with nearby orders and allows customers to track their deliveries in real-time.'
    },
    {
      question: 'When do I get paid?',
      answer: 'Earnings are typically processed weekly. Check with support for specific payment schedules and methods available in your area.'
    },
    {
      question: 'What vehicle types are accepted?',
      answer: 'We accept bicycles, motorcycles, cars, and even walking for short distances. Make sure your vehicle information is up to date in your profile.'
    },
    {
      question: 'How do I improve my rating?',
      answer: 'Provide excellent service, be punctual, communicate clearly with customers, and handle orders with care. Good ratings lead to more delivery opportunities.'
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
      color: 'bg-green-100 text-green-600',
      href: 'tel:+2348000000000'
    },
    {
      title: 'Email Support',
      description: 'Send us an email',
      icon: Mail,
      action: 'Send Email',
      color: 'bg-purple-100 text-purple-600',
      href: 'mailto:support@borrands.com'
    }
  ];

  const tickets = [
    {
      id: 'TKT-001',
      subject: 'Payment issue',
      status: 'open',
      category: 'Payment',
      createdAt: '2024-01-15 14:30',
      lastUpdate: '2024-01-15 16:45'
    },
    {
      id: 'TKT-002',
      subject: 'Account verification',
      status: 'resolved',
      category: 'Account',
      createdAt: '2024-01-14 10:15',
      lastUpdate: '2024-01-14 11:30'
    }
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API
    alert('Ticket submitted! Our support team will get back to you soon.');
    setTicketSubject('');
    setTicketMessage('');
    setTicketCategory('');
  };

  return (
    <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackArrow href="/dashboard/rider" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            <p className="text-sm text-gray-600 mt-1">Get help and contact support</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Contact Methods */}
            <div className="grid md:grid-cols-3 gap-4">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 text-center"
                >
                  <div className={`w-12 h-12 ${method.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <method.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{method.description}</p>
                  {method.href ? (
                    <a
                      href={method.href}
                      className="inline-block px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                    >
                      {method.action}
                    </a>
                  ) : (
                    <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
                      {method.action}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Submit Ticket Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit a Support Ticket</h2>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="payment">Payment Issue</option>
                    <option value="account">Account Issue</option>
                    <option value="delivery">Delivery Issue</option>
                    <option value="technical">Technical Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="Please provide details about your issue..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {tickets.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Support Tickets</h3>
                <p className="text-gray-600">You haven't submitted any support tickets yet.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'open'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {ticket.status === 'open' ? (
                            <Clock className="h-3 w-3 inline mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                          )}
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Category: {ticket.category}</p>
                      <p className="text-xs text-gray-500">
                        Created: {ticket.createdAt} • Last update: {ticket.lastUpdate}
                      </p>
                    </div>
                    <button className="text-brand-primary hover:text-brand-accent text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
