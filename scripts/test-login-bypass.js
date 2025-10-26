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
            data: JSON.parse(body),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testBypassLogin() {
  console.log('🔓 Testing bypass login...\n');
  
  const testPhone = '+2347055699437';
  
  console.log('Using phone:', testPhone);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const response = await makeRequest(
      'http://localhost:3000/api/auth/test-login',
      JSON.stringify({ phone: testPhone })
    );
    
    console.log('Response Status:', response.statusCode);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n✅ BYPASS LOGIN SUCCESSFUL!');
      console.log('User:', response.data.data.user.name);
      console.log('Role:', response.data.data.user.role);
      console.log('Token:', response.data.data.token ? 'Generated' : 'Missing');
      
      // Extract cookies
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        console.log('Auth Cookie:', setCookieHeader[0] ? 'Set' : 'Missing');
      }
      
      console.log('\n🎉 You can now access the restaurant dashboard!');
      console.log('Dashboard URL: http://localhost:3000/dashboard/restaurant');
      
    } else {
      console.log('\n❌ BYPASS LOGIN FAILED!');
      console.log('Error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testBypassLogin();
