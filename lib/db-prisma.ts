import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database connection function
export async function dbConnect() {
  try {
    await prisma.$connect();
    console.log('✅ MySQL database connected successfully');
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
    
    return {
      status: 'healthy',
      readyState: 'connected',
      pingOk: true,
      responseTime: `${responseTime}ms`,
      database: dbInfo[0]?.database_name || 'unknown',
      version: dbInfo[0]?.version || 'unknown',
      connectionId: dbInfo[0]?.connection_id || 'unknown',
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

export default prisma;
