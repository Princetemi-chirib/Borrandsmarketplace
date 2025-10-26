require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function verifyCredentials() {
  console.log('🔐 MongoDB Atlas Credential Verification');
  console.log('========================================\n');

  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.log('❌ MONGODB_URI not found');
    return;
  }

  // Extract credentials from URI for verification
  const uriMatch = MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
  
  if (uriMatch) {
    const [, username, password, host, database] = uriMatch;
    console.log('📋 Extracted Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password.length > 0 ? '***' + password.slice(-2) : 'empty'}`);
    console.log(`   Host: ${host}`);
    console.log(`   Database: ${database}`);
    console.log('');
  }

  console.log('🔌 Testing connection with current credentials...');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
    });
    
    console.log('✅ Authentication successful!');
    console.log(`   Connected to: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Collections found: ${collections.length}`);
    
  } catch (error) {
    console.log('❌ Authentication failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('bad auth')) {
      console.log('\n💡 Authentication failed - possible issues:');
      console.log('   1. Username is incorrect');
      console.log('   2. Password is incorrect');
      console.log('   3. User does not exist in MongoDB Atlas');
      console.log('   4. User does not have permissions for this database');
      console.log('   5. User account is locked or disabled');
      console.log('\n🔧 Solutions:');
      console.log('   - Check your MongoDB Atlas dashboard');
      console.log('   - Verify the username and password');
      console.log('   - Ensure the user has proper permissions');
      console.log('   - Try creating a new database user in Atlas');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ Disconnected');
    }
  }
}

verifyCredentials().catch(console.error);
