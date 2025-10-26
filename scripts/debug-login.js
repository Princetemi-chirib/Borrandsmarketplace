const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/borrands');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function debugLogin() {
  try {
    await connectDB();
    
    // Define User schema inline
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const testPhone = '+2348999888777';
    const testPassword = 'restaurant123';
    
    console.log('🔍 Debugging login for:', testPhone);
    console.log('Expected password:', testPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Find user with password field included
    const user = await User.findOne({ phone: testPhone }).select('+password');
    
    if (!user) {
      console.log('❌ User not found with phone:', testPhone);
      
      // List all users to see what's available
      const allUsers = await User.find({}, 'name phone role isVerified phoneVerified');
      console.log('\n📋 Available users:');
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.name} - ${u.phone} (${u.role}) - Verified: ${u.isVerified}/${u.phoneVerified}`);
      });
      return;
    }
    
    console.log('✅ User found:');
    console.log('Name:', user.name);
    console.log('Phone:', user.phone);
    console.log('Role:', user.role);
    console.log('Is Active:', user.isActive);
    console.log('Is Verified:', user.isVerified);
    console.log('Phone Verified:', user.phoneVerified);
    console.log('WhatsApp Verified:', user.whatsappVerified);
    console.log('Has Password:', !!user.password);
    console.log('Password Length:', user.password ? user.password.length : 0);
    console.log('Password Starts With $2a:', user.password ? user.password.startsWith('$2a') : false);
    
    if (!user.password) {
      console.log('\n❌ No password set for user. Setting password...');
      
      // Hash and set password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      await User.findByIdAndUpdate(user._id, { 
        password: hashedPassword,
        isVerified: true,
        phoneVerified: true,
        whatsappVerified: true
      });
      
      console.log('✅ Password set and user verified');
      return;
    }
    
    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    
    try {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('Password comparison result:', isValid);
      
      if (!isValid) {
        console.log('❌ Password does not match. Resetting password...');
        
        // Reset password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        
        await User.findByIdAndUpdate(user._id, { 
          password: hashedPassword,
          isVerified: true,
          phoneVerified: true,
          whatsappVerified: true
        });
        
        console.log('✅ Password reset successfully');
      } else {
        console.log('✅ Password matches correctly');
        
        // Ensure user is verified
        if (!user.isVerified || !user.phoneVerified) {
          await User.findByIdAndUpdate(user._id, { 
            isVerified: true,
            phoneVerified: true,
            whatsappVerified: true
          });
          console.log('✅ User verification status updated');
        }
      }
    } catch (compareError) {
      console.log('❌ Error comparing password:', compareError.message);
      
      // Reset password due to comparison error
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      await User.findByIdAndUpdate(user._id, { 
        password: hashedPassword,
        isVerified: true,
        phoneVerified: true,
        whatsappVerified: true
      });
      
      console.log('✅ Password reset due to comparison error');
    }
    
    console.log('\n🎉 LOGIN DEBUG COMPLETE!');
    console.log('\n📋 UPDATED LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Phone:', testPhone);
    console.log('Password:', testPassword);
    console.log('Status: Ready for login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

debugLogin();




