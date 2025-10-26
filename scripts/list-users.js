const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/borrands');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function listUsers() {
  try {
    await connectDB();
    
    // Define User schema inline to avoid import issues
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // Find all users
    const users = await User.find({}).limit(10);
    
    console.log(`Found ${users.length} users:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Phone Verified: ${user.phoneVerified}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ─────────────────────────────────────');
    });
    
    // Look specifically for our test user
    const testUser = await User.findOne({ phone: { $regex: '8123456789' } });
    if (testUser) {
      console.log('\n🎯 Found test user:');
      console.log('Name:', testUser.name);
      console.log('Phone:', testUser.phone);
      console.log('Role:', testUser.role);
      console.log('Verified:', testUser.isVerified);
      console.log('Phone Verified:', testUser.phoneVerified);
      
      // Auto-verify the test user
      await User.findByIdAndUpdate(testUser._id, {
        isVerified: true,
        phoneVerified: true,
        whatsappVerified: true
      });
      console.log('✅ Test user has been verified!');
    } else {
      console.log('\n❌ No test user found with phone ending in 8123456789');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

listUsers();




