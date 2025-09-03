const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function debugRegistration() {
  const testData = {
    name: 'Debug Test User',
    phone: '+2341234567890',
    role: 'student',
    university: 'University of Lagos',
    studentId: 'DEBUG123',
    department: 'Computer Science',
    level: '300'
  };

  console.log('🔍 Debugging registration issue...\n');
  console.log('Test data:', testData);
  console.log('');

  try {
    console.log('📡 Sending registration request...');
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('📄 Response body:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', result.message);
    }

  } catch (error) {
    console.error('💥 Network/Request error:', error.message);
    console.error('Error details:', error);
  }
}

// Run the debug
debugRegistration();


