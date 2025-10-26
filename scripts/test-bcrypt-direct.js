const bcrypt = require('bcryptjs');
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

async function testBcryptDirect() {
  try {
    await connectDB();
    
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const testPhone = '+2349876543210';
    const testPassword = 'test123456';
    
    console.log('🧪 Testing bcrypt directly...');
    console.log('Phone:', testPhone);
    console.log('Password:', testPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Find the user
    const user = await User.findOne({ phone: testPhone }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.name);
    console.log('Has password:', !!user.password);
    console.log('Password length:', user.password ? user.password.length : 0);
    console.log('Password starts with $2a:', user.password ? user.password.startsWith('$2a') : false);
    
    // Test bcrypt directly
    console.log('\n🔐 Testing bcrypt.compare directly...');
    const directResult = await bcrypt.compare(testPassword, user.password);
    console.log('Direct bcrypt.compare result:', directResult);
    
    // Test using user method
    console.log('\n🔐 Testing user.comparePassword method...');
    try {
      const methodResult = await user.comparePassword(testPassword);
      console.log('User method result:', methodResult);
    } catch (error) {
      console.log('User method error:', error.message);
    }
    
    // Test with different password to ensure it fails
    console.log('\n🔐 Testing with wrong password...');
    const wrongResult = await bcrypt.compare('wrongpassword', user.password);
    console.log('Wrong password result (should be false):', wrongResult);
    
    if (directResult) {
      console.log('\n✅ Password verification works correctly!');
    } else {
      console.log('\n❌ Password verification failed!');
      
      // Try to fix by resetting password
      console.log('Attempting to fix password...');
      const salt = await bcrypt.genSalt(12);
      const newHash = await bcrypt.hash(testPassword, salt);
      
      await User.findByIdAndUpdate(user._id, { password: newHash });
      console.log('Password updated. Testing again...');
      
      const retestUser = await User.findById(user._id).select('+password');
      const retestResult = await bcrypt.compare(testPassword, retestUser.password);
      console.log('Retest result:', retestResult);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

testBcryptDirect();




