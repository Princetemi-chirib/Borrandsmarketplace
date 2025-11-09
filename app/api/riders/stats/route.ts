import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user and verify role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'RIDER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get rider profile
    const rider = await prisma.rider.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        totalDeliveries: true,
        totalEarnings: true,
        rating: true,
        reviewCount: true,
        averageDeliveryTime: true,
        completionRate: true
      }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    // Get all deliveries for this rider
    const allDeliveries = await prisma.order.findMany({
      where: { riderId: rider.id },
      select: {
        id: true,
        status: true,
        total: true,
        deliveryFee: true,
        createdAt: true
      }
    });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Today's deliveries
    const todayDeliveries = allDeliveries.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today && orderDate < tomorrow;
    });

    // This week's deliveries
    const weekDeliveries = allDeliveries.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= weekStart && orderDate < weekEnd;
    });

    // Active deliveries (not delivered or cancelled)
    const activeDeliveries = allDeliveries.filter(o => 
      !['DELIVERED', 'CANCELLED'].includes(o.status)
    ).length;

    // Completed deliveries
    const completedDeliveries = allDeliveries.filter(o => 
      o.status === 'DELIVERED'
    ).length;

    // Calculate earnings (delivery fee is rider's earnings)
    const totalEarnings = allDeliveries
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.deliveryFee, 0);

    const todayEarnings = todayDeliveries
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.deliveryFee, 0);

    const weeklyEarnings = weekDeliveries
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.deliveryFee, 0);

    const stats = {
      totalDeliveries: allDeliveries.length,
      activeDeliveries,
      completedDeliveries,
      totalEarnings,
      averageRating: rider.rating,
      todayEarnings,
      weeklyEarnings,
      totalDistance: 0, // TODO: Calculate from location tracking
      averageDeliveryTime: rider.averageDeliveryTime,
      completionRate: rider.completionRate
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Error fetching rider stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rider statistics' },
      { status: 500 }
    );
  }
}

