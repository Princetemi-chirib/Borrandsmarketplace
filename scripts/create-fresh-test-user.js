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

async function createFreshTestUser() {
  try {
    await connectDB();
    
    // Define schemas inline
    const userSchema = new mongoose.Schema({}, { strict: false });
    const restaurantSchema = new mongoose.Schema({}, { strict: false });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
    
    // Use a completely new phone number
    const testPhone = '+2349876543210';
    const testPassword = 'test123456';
    
    console.log('🚀 Creating fresh test user...');
    console.log('Phone:', testPhone);
    console.log('Password:', testPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Delete any existing user with this phone
    const existingUser = await User.findOne({ phone: testPhone });
    if (existingUser) {
      console.log('Deleting existing user...');
      await Restaurant.findOneAndDelete({ userId: existingUser._id });
      await User.findByIdAndDelete(existingUser._id);
    }
    
    // Hash password manually
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    console.log('Password hashed successfully');
    console.log('Hash starts with $2a:', hashedPassword.startsWith('$2a'));
    console.log('Hash length:', hashedPassword.length);
    
    // Test the hash immediately
    const testComparison = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Immediate hash test:', testComparison);
    
    if (!testComparison) {
      throw new Error('Password hash test failed immediately');
    }
    
    // Create user
    console.log('Creating user...');
    const userData = {
      name: 'Fresh Test Restaurant',
      phone: testPhone,
      password: hashedPassword,
      role: 'restaurant',
      university: 'University of Lagos',
      isVerified: true,
      isActive: true,
      phoneVerified: true,
      whatsappVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const user = new User(userData);
    await user.save();
    console.log('✅ User created with ID:', user._id);
    
    // Verify the saved user
    const savedUser = await User.findById(user._id).select('+password');
    console.log('Saved user verification:');
    console.log('- Has password:', !!savedUser.password);
    console.log('- Password length:', savedUser.password ? savedUser.password.length : 0);
    console.log('- Phone verified:', savedUser.phoneVerified);
    console.log('- Is active:', savedUser.isActive);
    
    // Test password comparison on saved user
    const savedComparison = await bcrypt.compare(testPassword, savedUser.password);
    console.log('- Password comparison works:', savedComparison);
    
    if (!savedComparison) {
      throw new Error('Password comparison failed on saved user');
    }
    
    // Create restaurant
    console.log('Creating restaurant...');
    const restaurantData = {
      userId: user._id,
      name: 'Fresh Test Pizza Place',
      description: 'A fresh test restaurant for login testing',
      address: '789 Test Street, Lagos',
      phone: testPhone,
      university: 'University of Lagos',
      cuisine: ['Pizza', 'Fast Food'],
      rating: 4.0,
      reviewCount: 10,
      isOpen: true,
      deliveryFee: 300,
      minimumOrder: 1000,
      estimatedDeliveryTime: 20,
      image: '',
      isApproved: true,
      isActive: true,
      phoneVerified: true,
      whatsappVerified: true,
      status: 'approved',
      approvedAt: new Date(),
      location: {
        type: 'Point',
        coordinates: [3.3792, 6.5244]
      },
      operatingHours: {
        monday: { open: '08:00', close: '22:00', isOpen: true },
        tuesday: { open: '08:00', close: '22:00', isOpen: true },
        wednesday: { open: '08:00', close: '22:00', isOpen: true },
        thursday: { open: '08:00', close: '22:00', isOpen: true },
        friday: { open: '08:00', close: '22:00', isOpen: true },
        saturday: { open: '09:00', close: '23:00', isOpen: true },
        sunday: { open: '10:00', close: '21:00', isOpen: true }
      },
      features: ['free-delivery', 'student-discount'],
      paymentMethods: ['cash', 'card'],
      categories: [],
      menu: [],
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        completionRate: 100
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();
    console.log('✅ Restaurant created with ID:', restaurant._id);
    
    // Final verification - test login simulation
    console.log('\n🧪 Testing login simulation...');
    const loginTestUser = await User.findOne({ phone: testPhone }).select('+password');
    const loginTest = await bcrypt.compare(testPassword, loginTestUser.password);
    console.log('Login simulation result:', loginTest);
    
    if (!loginTest) {
      throw new Error('Login simulation failed');
    }
    
    console.log('\n🎉 FRESH TEST USER CREATED SUCCESSFULLY!');
    console.log('\n📋 NEW LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Phone: ${testPhone}`);
    console.log(`Password: ${testPassword}`);
    console.log('Role: restaurant');
    console.log('University: University of Lagos');
    console.log('Status: Verified and Ready');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📱 Login URL: http://localhost:3000/auth/login');
    console.log('🏪 Dashboard: http://localhost:3000/dashboard/restaurant');
    
  } catch (error) {
    console.error('❌ Error creating fresh test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

createFreshTestUser();




