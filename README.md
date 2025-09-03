# Borrands Marketplace

A comprehensive food delivery platform connecting students, restaurants, and riders within university communities.

## Features

- **Multi-role Support**: Students, Restaurants, Riders, and Admins
- **Real-time Order Tracking**: Live delivery updates
- **WhatsApp Integration**: OTP verification and notifications
- **Payment Processing**: Secure payment with Paystack
- **Responsive Design**: Mobile-first approach

## Registration Flow Fix

### Issue
Users were getting "User with this phone already exists" error when trying to register with a new phone number, even if they hadn't completed the registration process.

### Root Cause
The registration flow created user records immediately upon form submission, before OTP verification. If users abandoned the process after form submission but before OTP verification, their unverified user records remained in the database, blocking future registration attempts.

### Solution
1. **Unverified User Cleanup**: The system now automatically deletes unverified users (older than 24 hours) during registration
2. **Re-registration Support**: Users can re-register if their previous attempt was incomplete (unverified)
3. **Better Error Handling**: More specific error messages guide users appropriately

### Technical Changes
- Modified `/api/auth/register/route.ts` to handle unverified users
- Added cleanup method to User model
- Updated error messages for better UX
- Improved send-otp route logic

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `env.example`)
4. Run the development server: `npm run dev`

## Testing

Run the registration test:
```bash
node scripts/test-registration.js
```

## License

MIT
