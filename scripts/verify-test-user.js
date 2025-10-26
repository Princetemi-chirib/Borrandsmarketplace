const mongoose = require('mongoose');
const path = require('path');

// Database connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/borrands');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function verifyTestUser() {
  try {
    await connectDB();

    const testPhone = '+2348123456789';
    
    // Define User schema inline to avoid import issues
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // Find and update the test user
    const user = await User.findOne({ phone: testPhone });
    
    if (!user) {
      console.log('❌ Test user not found');
      process.exit(1);
    }
    
    console.log('📱 Found test user:', user.name);
    
    // Update verification status
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        isVerified: true,
        phoneVerified: true,
        whatsappVerified: true
      },
      { new: true }
    );
    
    console.log('✅ Test user verified successfully');
    console.log('User ID:', updatedUser._id);
    console.log('Phone:', updatedUser.phone);
    console.log('Verified:', updatedUser.isVerified);
    console.log('Phone Verified:', updatedUser.phoneVerified);
    
    console.log('\n🎉 TEST USER IS NOW READY TO LOGIN!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Phone: +2348123456789');
    console.log('Password: testpass123');
    console.log('Role: restaurant');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📱 Login URL: http://localhost:3000/auth/login');
    
  } catch (error) {
    console.error('❌ Error verifying test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

// Run the script
verifyTestUser();




