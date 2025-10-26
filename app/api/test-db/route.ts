import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection via API...');
    
    // Connect to database
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    // Get connection info
    const connection = mongoose.connection;
    const dbInfo = {
      database: connection.db.databaseName,
      host: connection.host,
      port: connection.port,
      readyState: connection.readyState,
      isConnected: connection.readyState === 1
    };
    
    // Test basic operations
    const testCollection = connection.collection('api_test');
    const testDoc = { 
      test: 'api_connection', 
      timestamp: new Date(),
      endpoint: '/api/test-db'
    };
    
    // Insert test document
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Test document inserted');
    
    // Read it back
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Test document retrieved');
    
    // Clean up
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Test document cleaned up');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      database: dbInfo,
      operations: {
        insert: true,
        read: !!foundDoc,
        delete: true
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection test failed',
      error: {
        name: error.name,
        message: error.message,
        type: error.constructor.name
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } finally {
    // Don't disconnect here as it might affect other operations
    // The connection will be managed by the dbConnect function
  }
}
