# Local Development Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **Git**

## Quick Setup

### 1. Clone and Install Dependencies
```bash
git clone <your-repo-url>
cd Borrands
npm install
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your actual values
# At minimum, you need:
# - MONGODB_URI (for local MongoDB)
# - JWT_SECRET (any random string)
# - TWILIO credentials (for WhatsApp OTP)
```

### 3. Start MongoDB (Local)
```bash
# If you have MongoDB installed locally:
mongod

# Or use MongoDB Atlas (cloud):
# Update MONGODB_URI in .env.local with your Atlas connection string
```

### 4. Start Development Server
```bash
npm run dev
```

## Environment Variables Explained

### Required Variables
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NEXT_PUBLIC_APP_URL`: Your app's public URL (http://localhost:3000 for local dev)

### Twilio WhatsApp (Required for OTP)
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER`: Twilio WhatsApp number (+14155238886 for sandbox)

### Optional Variables
- `PAYSTACK_SECRET_KEY`: For payment processing
- `PAYSTACK_PUBLIC_KEY`: For payment processing

## Twilio WhatsApp Setup

1. **Create Twilio Account**: Sign up at [twilio.com](https://twilio.com)
2. **Get Credentials**: Find your Account SID and Auth Token in the Twilio Console
3. **Join WhatsApp Sandbox**: 
   - Send the join code from Twilio Console to `+1 415 523 8886`
   - This enables your phone to receive WhatsApp messages

## Database Setup

The app will automatically create the necessary collections when you first use it. No manual database setup required.

## Testing the Setup

1. Visit `http://localhost:3000`
2. Try registering a new user
3. You should receive an OTP via WhatsApp
4. Complete registration and test login

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check your connection string in `.env.local`
- For Atlas: Make sure your IP is whitelisted

### Twilio Issues
- Verify your credentials in `.env.local`
- Join the WhatsApp sandbox from your phone
- Check Twilio Console for any errors

### Port Issues
- If port 3000 is busy, Next.js will automatically use the next available port
- Check the terminal output for the actual URL

## Development Workflow

1. Make changes to your code
2. The development server will automatically reload
3. Test your changes
4. Commit and push to git

## Production Deployment

When deploying to production:
1. Update environment variables with production values
2. Set `NODE_ENV=production`
3. Use a production MongoDB instance
4. Configure proper Twilio WhatsApp Business API (not sandbox)
