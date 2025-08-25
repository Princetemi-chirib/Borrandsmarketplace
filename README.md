# University Marketplace

A comprehensive web-based platform designed to connect students, restaurants, and riders within university communities. The platform enables students to place orders from registered restaurants, restaurants to receive and manage orders, and riders to fulfill deliveries with real-time WhatsApp notifications via Twilio integration.

## 🚀 Features

### For Students
- Browse restaurants and menus
- Filter items by category, price, and availability
- Place orders with Paystack payment integration
- Real-time order tracking
- WhatsApp notifications for order status updates
- Order history and ratings
- Multi-university support

### For Restaurants
- Create and manage restaurant profile and menu
- Advanced inventory management with stock tracking
- Automatic stock deduction on orders
- Low-stock alerts via WhatsApp
- Order management (accept, prepare, reject)
- Assign orders to riders
- Sales history and analytics
- Real-time order notifications

### For Riders
- Rider profile with university affiliation
- View and accept delivery tasks
- Update delivery progress (picked up, en route, delivered)
- WhatsApp notifications for new requests
- Delivery history and earnings overview
- Location tracking

### For Admins
- Approve/reject restaurant and rider applications
- Manage users and monitor inventory compliance
- Resolve disputes and process refunds
- Analytics dashboard with comprehensive metrics
- Platform-wide monitoring and management

### WhatsApp Integration (Twilio)
- Automated notifications for each order stage
- Communication bridge among students, restaurants, and riders
- Optional chatbot for FAQs and support
- Real-time status updates

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Node.js with Next.js API routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **Payment Gateway**: Paystack integration
- **Notifications**: Twilio WhatsApp Business API
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Animations**: Framer Motion
- **Hosting**: Vercel (recommended)

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database (local or cloud)
- Twilio account for WhatsApp integration
- Paystack account for payment processing

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/university-marketplace.git
cd university-marketplace
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Optional: Email Service (for email verification)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 4. Database Setup

1. Set up a MongoDB database (local or cloud)
2. Update the `MONGODB_URI` in your `.env.local` file
3. The application will automatically create the necessary collections

### 5. Twilio Setup

1. Create a Twilio account at [twilio.com](https://www.twilio.com)
2. Set up WhatsApp Business API
3. Get your Account SID, Auth Token, and WhatsApp phone number
4. Update the Twilio environment variables

### 6. Paystack Setup

1. Create a Paystack account at [paystack.com](https://www.paystack.com)
2. Get your Secret Key and Public Key
3. Update the Paystack environment variables

### 7. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
university-marketplace/
├── app/                          # Next.js 14 app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── restaurants/          # Restaurant management
│   │   ├── orders/               # Order management
│   │   ├── riders/               # Rider management
│   │   └── admin/                # Admin endpoints
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── ui/                       # UI components
│   ├── forms/                    # Form components
│   └── layout/                   # Layout components
├── lib/                          # Utility libraries
│   ├── models/                   # Mongoose models
│   ├── auth.ts                   # Authentication utilities
│   ├── db.ts                     # Database connection
│   ├── paystack.ts               # Paystack integration
│   └── whatsapp.ts               # WhatsApp integration
├── types/                        # TypeScript type definitions
├── store/                        # Zustand state management
├── hooks/                        # Custom React hooks
└── utils/                        # Utility functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Google Cloud Run

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting (can be added)
- Secure payment processing
- Environment variable protection

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) ready

## 🔄 Real-time Features

- Live order tracking
- Real-time notifications via WhatsApp
- Instant status updates
- Live inventory management
- Real-time delivery tracking

## 📊 Analytics and Monitoring

- Order analytics
- Sales reports
- User activity tracking
- Performance monitoring
- Error logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@universitymarketplace.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Twilio for WhatsApp integration
- Paystack for payment processing
- All contributors and users

## 📈 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced payment options
- [ ] AI-powered recommendations
- [ ] Voice ordering
- [ ] Integration with university systems
- [ ] Advanced inventory forecasting
- [ ] Loyalty program
- [ ] Social features

---

**University Marketplace** - Connecting university communities through technology.
