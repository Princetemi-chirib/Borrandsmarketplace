async function testLogin() {
  try {
    console.log('🔍 Testing login API...');
    
    const loginData = {
      email: 'rabiutemi@gmail.com',
      password: 'Amanillah@12'
    };

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Login successful!');
      console.log('User:', result.data.user.name);
      console.log('Role:', result.data.user.role);
      console.log('Token received:', result.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Login failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
    console.log('\n💡 Make sure the development server is running: npm run dev');
  }
}

testLogin();
