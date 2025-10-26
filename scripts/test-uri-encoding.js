require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testURIFix() {
  console.log('🔍 Testing MongoDB URI Fix');
  console.log('==========================\n');

  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.log('❌ MONGODB_URI not found in .env.local');
    return;
  }

  console.log('📋 Current URI (masked):');
  const maskedURI = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`   ${maskedURI}\n`);

  // Check if URI contains unencoded special characters
  const hasUnencodedChars = /[<>@]/.test(MONGODB_URI.split('@')[0]);
  
  if (hasUnencodedChars) {
    console.log('❌ URI contains unencoded special characters!');
    console.log('💡 Your password contains <, @, or > which need URL encoding');
    console.log('\n🔧 Fix your .env.local file:');
    console.log('   Replace: <Amanillah@12>');
    console.log('   With:    %3CAmanillah%4012%3E');
    console.log('\n✅ Corrected URI should be:');
    console.log('   mongodb+srv://rabiutemi_db_user:%3CAmanillah%4012%3E@cluster0.vaoardq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  } else {
    console.log('✅ URI format looks correct - no unencoded special characters detected');
  }

  console.log('\n🧪 Testing connection...');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connection successful!');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('EBADNAME') || error.message.includes('authentication')) {
      console.log('\n💡 This is likely due to unencoded special characters in your password');
      console.log('   Please update your .env.local file with the URL-encoded password');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ Disconnected');
    }
  }
}

testURIFix().catch(console.error);
