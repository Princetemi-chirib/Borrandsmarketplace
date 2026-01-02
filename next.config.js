/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Use remotePatterns for Next.js 13+ (more secure than domains)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Allow unoptimized images for local paths and external URLs
    unoptimized: process.env.NODE_ENV === 'production' ? false : false,
    // Allow all image formats
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  },
}

module.exports = nextConfig


