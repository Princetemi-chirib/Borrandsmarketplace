import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

function rangeToMs(range: string) {
  switch (range) {
    case '7d': return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    case '90d': return 90 * 24 * 60 * 60 * 1000;
    case '1y': return 365 * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const since = new Date(Date.now() - rangeToMs(range));

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: auth.restaurantId,
        createdAt: { gte: since }
      },
      select: { total: true, paymentStatus: true, status: true, studentId: true }
    });

    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.total, 0);
    
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const uniqueCustomers = new Set(orders.map(o => o.studentId)).size;

    const data = {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completionRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
      customerCount: uniqueCustomers
    };

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load analytics summary' }, { status: 500 });
  }
}















