const fetch = require('node-fetch');

async function testRegistration() {
  try {
    console.log('Testing user registration with email and password...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student',
        university: 'Test University',
        studentId: 'TEST001',
        department: 'Computer Science',
        level: '300'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Registration successful!');
      console.log('User ID:', data.data.id);
      console.log('Email:', data.data.email);
      console.log('Role:', data.data.role);
    } else {
      console.log('❌ Registration failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testLogin() {
  try {
    console.log('\nTesting user login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('User:', data.data.user.name);
      console.log('Token received:', !!data.data.token);
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting authentication tests...\n');
  
  await testRegistration();
  await testLogin();
  
  console.log('\n✅ Tests completed!');
}

runTests();
