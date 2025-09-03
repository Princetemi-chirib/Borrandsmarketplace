const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testRegistration() {
  const testPhone = '+2341234567890';
  const testData = {
    name: 'Test User',
    phone: testPhone,
    role: 'student',
    university: 'University of Lagos',
    studentId: 'TEST123',
    department: 'Computer Science',
    level: '300'
  };

  console.log('🧪 Testing registration flow...\n');

  try {
    // Test 1: First registration attempt
    console.log('1️⃣ First registration attempt...');
    const response1 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    const result1 = await response1.json();
    console.log('Result:', result1.success ? '✅ Success' : '❌ Failed');
    console.log('Message:', result1.message);
    console.log('');

    // Test 2: Second registration attempt (should work now)
    console.log('2️⃣ Second registration attempt (should work now)...');
    const response2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    const result2 = await response2.json();
    console.log('Result:', result2.success ? '✅ Success' : '❌ Failed');
    console.log('Message:', result2.message);
    console.log('');

    // Test 3: Try with a verified user (simulate by creating one manually)
    console.log('3️⃣ Testing with different phone number...');
    const testData2 = { ...testData, phone: '+2349876543210' };
    const response3 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData2)
    });
    const result3 = await response3.json();
    console.log('Result:', result3.success ? '✅ Success' : '❌ Failed');
    console.log('Message:', result3.message);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRegistration();


