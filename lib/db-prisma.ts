import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaInstance: number;
};

// Track instance number for debugging
globalForPrisma.prismaInstance = globalForPrisma.prismaInstance || 0;

function createPrismaClient(): PrismaClient {
  globalForPrisma.prismaInstance++;
  console.log(`🔧 Creating Prisma client instance #${globalForPrisma.prismaInstance}`);
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export let prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Force recreate Prisma client (fixes prepared statement cache issues)
export async function recreatePrismaClient(): Promise<void> {
  try {
    console.log('🔄 Recreating Prisma client to fix prepared statement cache...');
    
    // Disconnect old client
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    
    // Wait for connection to fully close
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Create new client
    const newClient = createPrismaClient();
    
    // Connect new client
    await newClient.$connect();
    
    // Update references
    prisma = newClient;
    globalForPrisma.prisma = newClient;
    
    console.log('✅ Prisma client recreated successfully');
  } catch (error) {
    console.error('❌ Failed to recreate Prisma client:', error);
    throw error;
  }
}

// Database connection function
export async function dbConnect() {
  try {
    await prisma.$connect();
    return prisma;
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error);
    throw error;
  }
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - start;
    
    // Get database info
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        DATABASE() as database_name,
        VERSION() as version,
        CONNECTION_ID() as connection_id
    ` as any[];
    
    // Convert BigInt to string to avoid serialization issues
    const connectionId = dbInfo[0]?.connection_id 
      ? String(dbInfo[0].connection_id) 
      : 'unknown';
    
    return {
      status: 'healthy',
      readyState: 'connected',
      pingOk: true,
      responseTime: `${responseTime}ms`,
      database: dbInfo[0]?.database_name || 'unknown',
      version: dbInfo[0]?.version || 'unknown',
      connectionId: connectionId,
    };
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}

// Graceful shutdown
export async function dbDisconnect() {
  try {
    await prisma.$disconnect();
    console.log('🔌 MySQL database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MySQL:', error);
  }
}

// Helper function to check if an error is the prepared statement error (1615)
function isPreparedStatementError(error: any): boolean {
  if (!error) return false;
  
  const errorString = JSON.stringify(error).toLowerCase();
  const errorMessage = (error.message || '').toLowerCase();
  
  return errorString.includes('1615') || 
         errorMessage.includes('1615') ||
         errorMessage.includes('prepared statement needs to be re-prepared');
}

// Helper function to check if an error is a transient MySQL error
function isTransientMySQLError(error: any): boolean {
  if (!error) return false;
  
  const errorString = JSON.stringify(error).toLowerCase();
  const errorMessage = (error.message || '').toLowerCase();
  
  const transientPatterns = [
    '1615', // Prepared statement needs to be re-prepared
    '1205', // Lock wait timeout
    '1213', // Deadlock found
    'lost connection',
    'connection timed out',
    'connection reset',
  ];
  
  const fullText = `${errorString} ${errorMessage}`;
  return transientPatterns.some(pattern => fullText.includes(pattern));
}

// Retry utility with Prisma client recreation for error 1615
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 500
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      const isTransient = isTransientMySQLError(error);
      const isPrepStmtError = isPreparedStatementError(error);
      
      if ((isTransient || isPrepStmtError) && attempt < maxRetries) {
        console.log(`⚠️ MySQL error detected (attempt ${attempt + 1}/${maxRetries + 1}):`, {
          message: error.message?.substring(0, 150),
          isPreparedStatementError: isPrepStmtError,
        });
        
        // For prepared statement errors, recreate the entire Prisma client
        if (isPrepStmtError) {
          try {
            await recreatePrismaClient();
          } catch (recreateError) {
            console.warn('⚠️ Failed to recreate Prisma client:', recreateError);
          }
        } else {
          // For other transient errors, just reset connection
          try {
            await prisma.$disconnect();
            await new Promise(resolve => setTimeout(resolve, 100));
            await prisma.$connect();
          } catch (resetError) {
            console.warn('⚠️ Failed to reset connection:', resetError);
          }
        }
        
        const waitTime = delayMs * Math.pow(2, attempt);
        console.log(`⏳ Retrying after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (!isTransient && !isPrepStmtError) {
        console.error('❌ Non-transient error, not retrying:', error.message?.substring(0, 200));
      } else {
        console.error(`❌ Error persisted after ${maxRetries + 1} attempts`);
      }
      throw error;
    }
  }
  
  throw lastError;
}

// Reset database connection
export async function resetConnection() {
  try {
    await prisma.$disconnect();
    await new Promise(resolve => setTimeout(resolve, 100));
    await prisma.$connect();
    console.log('✅ Database connection reset successfully');
  } catch (error) {
    console.error('❌ Error resetting database connection:', error);
    throw error;
  }
}

export default prisma;
