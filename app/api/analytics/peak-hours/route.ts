import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '7', 10), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: auth.restaurantId,
        createdAt: { gte: since }
      },
      select: { createdAt: true }
    });

    // Group by hour
    const hourMap = new Map<number, number>();
    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    const peakHours = Array.from(hourMap.entries())
      .map(([hour, orders]) => ({ hour: `${hour}:00`, orders }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    return NextResponse.json({ peakHours });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load peak hours' }, { status: 500 });
  }
}















