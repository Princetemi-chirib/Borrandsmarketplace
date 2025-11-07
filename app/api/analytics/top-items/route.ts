import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '30', 10), 365);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: auth.restaurantId,
        createdAt: { gte: since },
        paymentStatus: 'PAID'
      },
      select: { items: true }
    });

    // Parse items and aggregate
    const itemMap = new Map<string, { orders: number; revenue: number }>();
    orders.forEach(order => {
      try {
        const items = JSON.parse(order.items as string);
        items.forEach((item: any) => {
          const existing = itemMap.get(item.name) || { orders: 0, revenue: 0 };
          existing.orders += item.quantity || 1;
          existing.revenue += (item.price || 0) * (item.quantity || 1);
          itemMap.set(item.name, existing);
        });
      } catch {}
    });

    const topItems = Array.from(itemMap.entries())
      .map(([name, data]) => ({ name, orders: data.orders, revenue: data.revenue }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, limit);

    return NextResponse.json({ topItems });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load top items' }, { status: 500 });
  }
}















