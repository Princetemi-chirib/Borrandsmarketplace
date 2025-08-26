# Borrands - University Marketplace

A comprehensive university marketplace platform connecting students, restaurants, and riders for seamless food ordering and delivery.

## Features

### 🔐 Authentication System
- **Phone-based OTP Authentication**: Primary authentication via WhatsApp OTP
- **Password Login**: Optional password-based login for convenience
- **Role-based Access**: Student, Restaurant, Rider, and Admin roles
- **Phone Verification**: Automatic verification via WhatsApp

### 👥 User Roles
- **Students**: Browse restaurants, place orders, track deliveries
- **Restaurants**: Manage menu, process orders, view analytics
- **Riders**: Accept deliveries, track earnings, manage availability
- **Admins**: Platform management, user oversight, analytics

### 🍽️ Core Features
- Restaurant browsing and menu management
- Real-time order tracking
- Payment integration (Paystack)
- WhatsApp notifications
- Mobile-responsive design
- Order history and reviews

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + WhatsApp OTP
- **Payment**: Paystack
- **Notifications**: Twilio WhatsApp Business API
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Twilio Account (for WhatsApp OTP)
- Paystack Account (for payments)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/borrands.git
   cd borrands
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/borrands
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   
   # Twilio WhatsApp (Required for OTP authentication)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   
   # Paystack (Payment Gateway)
   PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
   ```

4. **Set up Twilio WhatsApp**
   - Create a Twilio account
   - Enable WhatsApp Business API
   - Get your Account SID and Auth Token
   - Set up your WhatsApp phone number
   - Update the environment variables

5. **Set up Paystack**
   - Create a Paystack account
   - Get your test/live keys
   - Update the environment variables

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Authentication Flow

### Registration
1. User fills registration form (phone-first)
2. System sends OTP via WhatsApp
3. User verifies OTP
4. Account created and verified

### Login
1. **Password Login**: Phone + Password
2. **OTP Login**: Phone + WhatsApp OTP
3. JWT token generated and stored

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Password-based login
- `POST /api/auth/send-otp` - Send WhatsApp OTP
- `POST /api/auth/verify-otp` - Verify OTP and login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/orders` - Get user orders

### Restaurants
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/[id]` - Get restaurant details
- `GET /api/restaurants/[id]/menu` - Get restaurant menu

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]/status` - Update order status

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/verify` - Verify payment

## Database Models

### User
- Basic info (name, phone, role, university)
- OTP fields (code, expiration, attempts)
- Preferences and wallet
- Order statistics

### Restaurant
- Basic info and location
- Operating hours and features
- Menu items and categories
- Performance statistics

### Order
- Order details and items
- Status tracking
- Payment information
- Delivery details

### MenuItem
- Item details and pricing
- Nutritional information
- Availability and ratings

## WhatsApp Integration

The platform uses Twilio's WhatsApp Business API for:
- OTP delivery during registration/login
- Order status updates
- Delivery notifications
- Payment confirmations

### Setup Requirements
1. Twilio account with WhatsApp Business API enabled
2. Verified WhatsApp phone number
3. Proper environment configuration

## Payment Integration

Paystack integration handles:
- Card payments
- Bank transfers
- Payment verification
- Refund processing

## Mobile Responsiveness

All components are optimized for mobile devices with:
- Responsive design patterns
- Touch-friendly interfaces
- Optimized navigation
- Mobile-first approach

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Other Platforms
- Ensure MongoDB connection
- Configure environment variables
- Set up proper build commands

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@borrands.com or create an issue in the repository.
