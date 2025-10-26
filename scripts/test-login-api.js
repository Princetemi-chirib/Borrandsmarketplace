const https = require('https');
const http = require('http');

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testLogin() {
  console.log('🧪 Testing login API...\n');
  
  const testCredentials = {
    phone: '+2349876543210',
    password: 'test123456'
  };
  
  console.log('Test credentials:');
  console.log('Phone:', testCredentials.phone);
  console.log('Password:', testCredentials.password);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const response = await makeRequest(
      'http://localhost:3000/api/auth/login',
      JSON.stringify(testCredentials)
    );
    
    console.log('Response Status:', response.statusCode);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('User:', response.data.data.user.name);
      console.log('Role:', response.data.data.user.role);
      console.log('University:', response.data.data.user.university);
    } else {
      console.log('\n❌ LOGIN FAILED!');
      console.log('Error:', response.data.message);
      
      if (response.data.requiresVerification) {
        console.log('💡 Suggestion: User needs phone verification');
      }
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testLogin();
