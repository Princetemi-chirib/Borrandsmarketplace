const https = require('https');
const http = require('http');
const { URL } = require('url');

// Test restaurant data
const testUserData = {
  name: 'Test Restaurant Owner',
  phone: '+2348123456789',
  password: 'testpass123',
  role: 'restaurant',
  university: 'University of Lagos'
};

const testRestaurantData = {
  name: 'Pizza Palace Test',
  description: 'A test restaurant serving delicious pizzas and fast food',
  address: '123 University Road, Akoka, Lagos',
  phone: '+2348123456789',
  website: 'https://pizzapalace-test.com',
  university: 'University of Lagos',
  cuisine: ['Italian', 'Fast Food', 'Pizza'],
  deliveryFee: 500,
  minimumOrder: 2000,
  estimatedDeliveryTime: 30,
  location: {
    type: 'Point',
    coordinates: [3.3792, 6.5244] // Lagos coordinates
  },
  features: ['free-delivery', 'student-discount', 'fast-delivery'],
  paymentMethods: ['cash', 'card', 'mobile-money']
};

async function createTestRestaurant() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🚀 Creating test restaurant user...\n');

    // Step 1: Register the user
    console.log('1. Registering user...');
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData),
    });

    const registerResult = await registerResponse.json();
    
    if (!registerResult.success) {
      if (registerResult.message.includes('already exists')) {
        console.log('⚠️  User already exists, continuing...');
      } else {
        throw new Error(`Registration failed: ${registerResult.message}`);
      }
    } else {
      console.log('✅ User registered successfully');
    }

    // Step 2: Login to get authentication
    console.log('2. Logging in...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: testUserData.phone,
        password: testUserData.password,
      }),
    });

    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      throw new Error(`Login failed: ${loginResult.message}`);
    }
    
    console.log('✅ Login successful');
    
    // Extract auth token from cookies or response
    const cookies = loginResponse.headers.get('set-cookie');
    let authToken = '';
    if (cookies) {
      const tokenMatch = cookies.match(/auth-token=([^;]+)/);
      if (tokenMatch) {
        authToken = tokenMatch[1];
      }
    }

    // Step 3: Create restaurant profile
    console.log('3. Creating restaurant profile...');
    const restaurantResponse = await fetch(`${baseUrl}/api/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${authToken}`,
      },
      body: JSON.stringify(testRestaurantData),
    });

    const restaurantResult = await restaurantResponse.json();
    
    if (!restaurantResult.success) {
      // Try alternative endpoint if the first one fails
      console.log('Trying alternative restaurant creation method...');
      
      // Direct database creation via custom endpoint
      const directCreateResponse = await fetch(`${baseUrl}/api/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-restaurant',
          userData: testUserData,
          restaurantData: testRestaurantData
        }),
      });

      const directResult = await directCreateResponse.json();
      if (!directResult.success) {
        console.log('⚠️  Restaurant profile creation failed, but user exists');
      } else {
        console.log('✅ Restaurant profile created successfully');
      }
    } else {
      console.log('✅ Restaurant profile created successfully');
    }

    // Success message
    console.log('\n🎉 TEST RESTAURANT SETUP COMPLETED!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Phone: ${testUserData.phone}`);
    console.log(`Password: ${testUserData.password}`);
    console.log(`Role: ${testUserData.role}`);
    console.log(`University: ${testUserData.university}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📱 How to Login:');
    console.log('1. Go to: http://localhost:3000/auth/login');
    console.log('2. Enter the phone number and password above');
    console.log('3. Or use OTP login with just the phone number');
    console.log('\n🏪 Restaurant Details:');
    console.log(`Name: ${testRestaurantData.name}`);
    console.log('Status: Ready for approval/use');
    console.log('Location: Lagos, Nigeria');
    console.log('\n💡 Note: If the restaurant profile creation failed,');
    console.log('   you can complete the setup by logging in and');
    console.log('   filling out the restaurant registration form.');

  } catch (error) {
    console.error('❌ Error creating test restaurant:', error.message);
    
    // Still provide login info even if restaurant creation failed
    console.log('\n📋 USER LOGIN CREDENTIALS (may still work):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Phone: ${testUserData.phone}`);
    console.log(`Password: ${testUserData.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}

// Run the script
if (require.main === module) {
  createTestRestaurant();
}

module.exports = { createTestRestaurant };
