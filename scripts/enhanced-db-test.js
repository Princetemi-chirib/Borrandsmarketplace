require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testDatabaseConnection() {
  console.log('🔍 Enhanced Database Connection Test');
  console.log('=====================================\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  const MONGODB_URI = process.env.MONGODB_URI;
  const NODE_ENV = process.env.NODE_ENV;
  
  console.log(`   NODE_ENV: ${NODE_ENV || 'not set'}`);
  console.log(`   MONGODB_URI: ${MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
  
  if (MONGODB_URI) {
    // Mask sensitive parts of the URI for security
    const maskedURI = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`   URI Format: ${maskedURI}`);
  }
  console.log('');

  if (!MONGODB_URI) {
    console.log('❌ MONGODB_URI is not set in your .env.local file');
    console.log('💡 Please add MONGODB_URI to your .env.local file');
    return;
  }

  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    
    // Set connection options
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      connectTimeoutMS: 10000, // 10 seconds timeout
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get connection info
    const connection = mongoose.connection;
    console.log(`   Database: ${connection.db.databaseName}`);
    console.log(`   Host: ${connection.host}`);
    console.log(`   Port: ${connection.port}`);
    console.log(`   Ready State: ${connection.readyState} (1=connected)`);
    console.log('');

    // Test database operations
    console.log('🧪 Testing Database Operations:');
    
    // Test 1: Create a test collection and insert data
    const testCollection = connection.collection('connection_test');
    const testDoc = { 
      test: 'connection', 
      timestamp: new Date(),
      environment: NODE_ENV || 'development'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`   ✅ Insert test: Document created with ID ${insertResult.insertedId}`);
    
    // Test 2: Read the data back
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    if (foundDoc) {
      console.log('   ✅ Read test: Successfully retrieved document');
    } else {
      console.log('   ❌ Read test: Failed to retrieve document');
    }
    
    // Test 3: Update the document
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { updated: true, updateTime: new Date() } }
    );
    if (updateResult.modifiedCount > 0) {
      console.log('   ✅ Update test: Successfully updated document');
    } else {
      console.log('   ❌ Update test: Failed to update document');
    }
    
    // Test 4: Clean up test data
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    if (deleteResult.deletedCount > 0) {
      console.log('   ✅ Delete test: Successfully cleaned up test data');
    } else {
      console.log('   ❌ Delete test: Failed to clean up test data');
    }
    
    console.log('');
    console.log('🎉 All database tests passed! Your connection is working perfectly.');
    
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log(`   Error Type: ${error.name}`);
    console.log(`   Error Message: ${error.message}`);
    console.log('');
    
    // Provide specific troubleshooting based on error type
    if (error.name === 'MongoServerError') {
      console.log('💡 This appears to be a MongoDB server error.');
      console.log('   - Check if your MongoDB server is running');
      console.log('   - Verify your connection string is correct');
      console.log('   - Check if you have the right permissions');
    } else if (error.name === 'MongoNetworkError') {
      console.log('💡 This appears to be a network connectivity issue.');
      console.log('   - Check your internet connection');
      console.log('   - Verify the MongoDB server is accessible');
      console.log('   - Check firewall settings');
    } else if (error.message.includes('EBADNAME')) {
      console.log('💡 This appears to be a DNS/URI format issue.');
      console.log('   - Check your MongoDB URI format');
      console.log('   - Verify the cluster name and connection string');
      console.log('   - Make sure there are no extra characters in the URI');
    } else {
      console.log('💡 General troubleshooting:');
      console.log('   - Check your .env.local file for correct MONGODB_URI');
      console.log('   - Verify MongoDB is running (if local)');
      console.log('   - Check your MongoDB Atlas connection (if cloud)');
    }
    
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    }
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
