const fetch = require('node-fetch');

async function createUser() {
  try {
    const response = await fetch('http://localhost:3000/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Rabi Utemi',
        email: 'rabiutemi@gmail.com',
        password: 'Amanillah@12',
        phone: '+2348012345678',
        role: 'student',
        university: 'University of Lagos'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ User created successfully!');
      console.log('User details:', data.user);
    } else {
      console.log('❌ Failed to create user:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createUser();

