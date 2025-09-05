require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkUserSchema() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borrands';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the User model
    const User = require('../lib/models/User.ts').default;
    
    // Check if there are any existing users
    const users = await User.find({}).limit(5);
    console.log('📊 Found users:', users.length);
    
    if (users.length > 0) {
      console.log('🔍 First user structure:');
      console.log(JSON.stringify(users[0].toObject(), null, 2));
    }
    
    // Check the schema definition
    console.log('\n📋 User Schema fields:');
    const schemaFields = Object.keys(User.schema.paths);
    schemaFields.forEach(field => {
      const path = User.schema.paths[field];
      console.log(`${field}: ${path.instance} ${path.isRequired ? '(required)' : '(optional)'}`);
    });
    
    // Check if there are any validation errors
    console.log('\n🔍 Checking for email field in schema...');
    const emailPath = User.schema.paths.email;
    if (emailPath) {
      console.log('❌ Email field found in schema:', emailPath);
    } else {
      console.log('✅ No email field found in schema');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkUserSchema();
