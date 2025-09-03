require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking environment variables...\n');

const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER'
];

const optionalVars = [
  'PAYSTACK_SECRET_KEY',
  'PAYSTACK_PUBLIC_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV'
];

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('TOKEN') ? '[HIDDEN]' : value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('KEY') ? '[HIDDEN]' : value}`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (optional)`);
  }
});

console.log('\n🔧 Node Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 App URL:', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

// Check MongoDB connection string format
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  console.log('🗄️  MongoDB URI format:', mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://') ? '✅ Valid' : '❌ Invalid');
}


