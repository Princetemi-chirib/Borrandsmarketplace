import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get total counts
    const [totalUsers, totalRestaurants, totalRiders, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.rider.count(),
      prisma.order.count()
    ]);

    // Get pending approvals (restaurants with status pending)
    const pendingApprovals = await prisma.restaurant.count({
      where: { status: 'pending' }
    });

    // Get active users (users with isActive = true and logged in recently - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await prisma.user.count({
      where: {
        isActive: true,
        lastLogin: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Calculate total revenue (from DELIVERED orders with PAID payment status)
    const completedOrders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        paymentStatus: 'PAID'
      },
      select: {
        total: true
      }
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

    // Calculate platform rating (average rating from all orders with ratings)
    const ordersWithRatings = await prisma.order.findMany({
      where: {
        rating: {
          not: null
        }
      },
      select: {
        rating: true
      }
    });
    const platformRating = ordersWithRatings.length > 0
      ? ordersWithRatings.reduce((sum, order) => sum + (order.rating || 0), 0) / ordersWithRatings.length
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalRestaurants,
        totalRiders,
        totalOrders,
        totalRevenue,
        pendingApprovals,
        activeUsers,
        platformRating: Math.round(platformRating * 10) / 10
      }
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch statistics'
    }, { status: 500 });
  }
}




