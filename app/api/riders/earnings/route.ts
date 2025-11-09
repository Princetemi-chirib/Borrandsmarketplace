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
      select: { id: true, totalEarnings: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, today, week, month

    // Get all completed deliveries
    const deliveries = await prisma.order.findMany({
      where: {
        riderId: rider.id,
        status: 'DELIVERED'
      },
      select: {
        id: true,
        deliveryFee: true,
        createdAt: true,
        actualDeliveryTime: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate date ranges
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter deliveries by period
    let filteredDeliveries = deliveries;
    if (period === 'today') {
      filteredDeliveries = deliveries.filter(d => 
        new Date(d.createdAt) >= today
      );
    } else if (period === 'week') {
      filteredDeliveries = deliveries.filter(d => 
        new Date(d.createdAt) >= weekStart
      );
    } else if (period === 'month') {
      filteredDeliveries = deliveries.filter(d => 
        new Date(d.createdAt) >= monthStart
      );
    }

    // Calculate earnings
    const totalEarnings = filteredDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
    const deliveryCount = filteredDeliveries.length;
    const averageEarning = deliveryCount > 0 ? totalEarnings / deliveryCount : 0;

    // Group earnings by date
    const earningsByDate: { [key: string]: number } = {};
    filteredDeliveries.forEach(d => {
      const date = new Date(d.createdAt).toISOString().split('T')[0];
      earningsByDate[date] = (earningsByDate[date] || 0) + d.deliveryFee;
    });

    // Convert to array for frontend
    const dailyEarnings = Object.entries(earningsByDate).map(([date, earnings]) => ({
      date,
      earnings,
      count: filteredDeliveries.filter(d => 
        new Date(d.createdAt).toISOString().split('T')[0] === date
      ).length
    })).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      earnings: {
        total: totalEarnings,
        deliveryCount,
        average: averageEarning,
        period,
        dailyEarnings
      }
    });
  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}

