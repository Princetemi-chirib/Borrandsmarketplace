require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the existing User model instead of creating a new schema
const User = require('../lib/models/User.ts').default;

async function createUser() {
  try {
    // Connect to MongoDB using the provided connection string
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borrands';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB at mongodb://localhost:27017/borrands');

    // Check if user already exists
    const existingUser = await User.findOne({ phone: '+2348012345678' });
    if (existingUser) {
      console.log('⚠️  User with phone +2348012345678 already exists');
      console.log('User details:', {
        _id: existingUser._id,
        name: existingUser.name,
        phone: existingUser.phone,
        role: existingUser.role,
        university: existingUser.university,
        isVerified: existingUser.isVerified,
        isActive: existingUser.isActive
      });
      return;
    }

    // Create new user
    const user = new User({
      name: 'Rabi Utemi',
      phone: '+2348012345678',
      password: 'Amanillah@12',
      role: 'student',
      university: 'University of Lagos',
      isVerified: true,
      isActive: true,
      phoneVerified: true
    });

    await user.save();
    console.log('✅ User created successfully!');
    console.log('User details:', {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      university: user.university,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt
    });

    console.log('\n📝 Login Credentials:');
    console.log('Phone: +2348012345678');
    console.log('Password: Amanillah@12');
    console.log('Role: student');

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createUser();
