import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all orders for this restaurant (use subtotal for revenue — excludes service & delivery)
    const allOrders = await prisma.order.findMany({
      where: { restaurantId: auth.restaurantId },
      select: {
        id: true,
        status: true,
        total: true,
        subtotal: true,
        createdAt: true,
        rating: true
      }
    });

    // Get today's date range in UTC to match database
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

    // Today's orders (comparing UTC dates)
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= todayUTC && orderDate < tomorrowUTC;
    });

    // Calculate statistics
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
    const completedOrders = allOrders.filter(o => o.status === 'DELIVERED').length;
    const totalRevenue = allOrders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + (order.subtotal ?? 0), 0);
    const todayRevenue = todayOrders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + (order.subtotal ?? 0), 0);

    // Calculate average rating
    const ratedOrders = allOrders.filter(o => o.rating && o.rating > 0);
    const averageRating = ratedOrders.length > 0
      ? ratedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / ratedOrders.length
      : 0;

    // Get menu items count
    const totalMenuItems = await prisma.menuItem.count({
      where: { restaurantId: auth.restaurantId }
    });

    // Get low stock items count
    const lowStockItems = await prisma.inventoryItem.count({
      where: {
        restaurantId: auth.restaurantId,
        status: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] }
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        totalMenuItems,
        lowStockItems,
        todayRevenue
      }
    });
  } catch (error: any) {
    console.error('Error fetching restaurant stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

