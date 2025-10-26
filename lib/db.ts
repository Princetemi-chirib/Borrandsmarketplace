import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borrands';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

// Enhanced connection options for production
const getConnectionOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    // Connection Pool Settings
    maxPoolSize: isProduction ? 20 : 10, // Maximum number of connections
    minPoolSize: isProduction ? 5 : 2,   // Minimum number of connections
    maxIdleTimeMS: 30000,                // Close connections after 30 seconds of inactivity
    
    // Timeout Settings
    serverSelectionTimeoutMS: 5000,       // How long to try selecting a server
    socketTimeoutMS: 45000,               // How long to wait for a response
    connectTimeoutMS: 10000,              // How long to wait for initial connection
    
    // Buffer Settings
    bufferCommands: false,                // Disable mongoose buffering
    bufferMaxEntries: 0,                  // Disable mongoose buffering
    
    // Retry Settings
    retryWrites: true,                    // Retry write operations
    retryReads: true,                     // Retry read operations
    
    // SSL/TLS Settings (for production)
    ...(isProduction && {
      ssl: true,
      sslValidate: true,
    }),
    
    // Additional Production Settings
    ...(isProduction && {
      readPreference: 'secondaryPreferred', // Read from secondary if available
      compressors: ['zlib'],               // Enable compression
    }),
  };
};

async function dbConnect() {
  // Skip database connection during build time
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL && !process.env.MONGODB_URI) {
    console.warn('Skipping database connection during build time - no MONGODB_URI provided');
    return null;
  }

  // Return cached connection if exists and is ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Create new connection promise if none exists
  if (!cached.promise) {
    const opts = getConnectionOptions();

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Database connected successfully');
      
      // Set up connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error('❌ Database connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ Database disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 Database reconnected');
      });
      
      return mongoose;
    }).catch((error) => {
      console.error('❌ Database connection failed:', error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Database connection error:', e);
    throw e;
  }

  return cached.conn;
}

// Enhanced database health check
export async function checkDatabaseHealth() {
  try {
    const conn = await dbConnect();
    if (!conn) return { status: 'skipped', message: 'Build time - no connection' };
    
    const readyState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    let pingOk = false;
    let responseTime = 0;
    
    try {
      if (mongoose.connection.db) {
        const start = Date.now();
        const admin = mongoose.connection.db.admin();
        const ping = await admin.ping();
        responseTime = Date.now() - start;
        pingOk = !!ping?.ok;
      }
    } catch (pingError) {
      console.warn('Database ping failed:', pingError);
    }
    
    return {
      status: readyState === 1 ? 'healthy' : 'unhealthy',
      readyState: states[readyState as keyof typeof states],
      pingOk,
      responseTime: `${responseTime}ms`,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}

export default dbConnect;



