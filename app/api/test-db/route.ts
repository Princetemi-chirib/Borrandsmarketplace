import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection via API...');
    
    // Connect to database
    await dbConnect();
    console.log('✅ Database connected successfully');
    
    // Test basic Prisma operations
    const userCount = await prisma.user.count();
    const restaurantCount = await prisma.restaurant.count();
    
    return NextResponse.json({
      success: true,
      message: 'MySQL database connection test successful (Prisma)',
      database: {
        type: 'MySQL',
        isConnected: true
      },
      stats: {
        users: userCount,
        restaurants: restaurantCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ MySQL database test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection test failed',
      error: {
        name: (error as Error).name,
        message: (error as Error).message,
        type: (error as Error).constructor.name
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
