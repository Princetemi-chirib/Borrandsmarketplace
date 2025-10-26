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

async function createVerifiedTestUser() {
  try {
    await connectDB();
    
    // Define schemas inline
    const userSchema = new mongoose.Schema({}, { strict: false });
    const restaurantSchema = new mongoose.Schema({}, { strict: false });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
    
    const testPhone = '+2348999888777'; // Different phone number
    const testPassword = 'restaurant123';
    
    // Check if user already exists
    let existingUser = await User.findOne({ phone: testPhone });
    if (existingUser) {
      console.log('Deleting existing test user...');
      await User.findByIdAndDelete(existingUser._id);
      await Restaurant.findOneAndDelete({ userId: existingUser._id });
    }
    
    console.log('Creating new verified test restaurant user...');
    
    // Create user with verification already set
    const userData = {
      name: 'Pizza Palace Owner',
      phone: testPhone,
      password: testPassword,
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
    
    console.log('✅ User created successfully');
    console.log('User ID:', user._id);
    
    // Create restaurant profile
    const restaurantData = {
      userId: user._id,
      name: 'Pizza Palace Test Restaurant',
      description: 'Delicious pizzas and Italian cuisine for university students',
      address: '456 Campus Road, University of Lagos, Akoka',
      phone: testPhone,
      website: 'https://pizzapalace.test',
      university: 'University of Lagos',
      cuisine: ['Italian', 'Pizza', 'Fast Food'],
      rating: 4.5,
      reviewCount: 25,
      isOpen: true,
      deliveryFee: 500,
      minimumOrder: 1500,
      estimatedDeliveryTime: 25,
      image: '/images/default-restaurant.jpg',
      isApproved: true,
      isActive: true,
      phoneVerified: true,
      whatsappVerified: true,
      status: 'approved',
      approvedAt: new Date(),
      location: {
        type: 'Point',
        coordinates: [3.3792, 6.5244] // Lagos coordinates
      },
      operatingHours: {
        monday: { open: '09:00', close: '22:00', isOpen: true },
        tuesday: { open: '09:00', close: '22:00', isOpen: true },
        wednesday: { open: '09:00', close: '22:00', isOpen: true },
        thursday: { open: '09:00', close: '22:00', isOpen: true },
        friday: { open: '09:00', close: '23:00', isOpen: true },
        saturday: { open: '10:00', close: '23:00', isOpen: true },
        sunday: { open: '11:00', close: '21:00', isOpen: true }
      },
      features: ['free-delivery', 'student-discount', 'fast-delivery'],
      paymentMethods: ['cash', 'card', 'mobile-money'],
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
    
    console.log('✅ Restaurant created successfully');
    console.log('Restaurant ID:', restaurant._id);
    
    console.log('\n🎉 TEST RESTAURANT USER CREATED AND VERIFIED!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Phone: ${testPhone}`);
    console.log(`Password: ${testPassword}`);
    console.log('Role: restaurant');
    console.log('University: University of Lagos');
    console.log('Status: Verified and Approved');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📱 How to Login:');
    console.log('1. Go to: http://localhost:3000/auth/login');
    console.log('2. Enter phone and password above');
    console.log('3. You should be redirected to the restaurant dashboard');
    console.log('\n🏪 Restaurant Details:');
    console.log('Name: Pizza Palace Test Restaurant');
    console.log('Status: Approved and Active');
    console.log('Location: University of Lagos');
    console.log('Dashboard: http://localhost:3000/dashboard/restaurant');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

createVerifiedTestUser();




