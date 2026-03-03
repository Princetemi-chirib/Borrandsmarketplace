import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';

/**
 * POST /api/admin/orders/bulk-mark-delivered
 * Mark all matching orders as DELIVERED and PAID (admin only).
 * Body: { date?: string (YYYY-MM-DD), restaurantId?: string }
 * At least one of date or restaurantId is required.
 * Only orders not already CANCELLED or DELIVERED are updated.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { date: dateStr, restaurantId } = body as { date?: string; restaurantId?: string };

    if (!dateStr && !restaurantId) {
      return NextResponse.json(
        { success: false, message: 'At least one of date or restaurantId is required' },
        { status: 400 }
      );
    }

    if (restaurantId && typeof restaurantId === 'string') {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { id: true }
      });
      if (!restaurant) {
        return NextResponse.json(
          { success: false, message: 'Restaurant not found' },
          { status: 404 }
        );
      }
    }

    let createdAtRange: { gte: Date; lte: Date } | undefined;
    if (dateStr && typeof dateStr === 'string') {
      const dayStart = new Date(dateStr);
      if (isNaN(dayStart.getTime())) {
        return NextResponse.json(
          { success: false, message: 'Invalid date (use YYYY-MM-DD)' },
          { status: 400 }
        );
      }
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      createdAtRange = { gte: dayStart, lte: dayEnd };
    }

    const where = {
      status: { notIn: [OrderStatus.CANCELLED, OrderStatus.DELIVERED] },
      ...(restaurantId && typeof restaurantId === 'string' ? { restaurantId } : {}),
      ...(createdAtRange ? { createdAt: createdAtRange } : {})
    };

    const now = new Date();
    const result = await prisma.order.updateMany({
      where,
      data: {
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        actualDeliveryTime: now
      }
    });

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} order(s) as delivered`,
      count: result.count
    });
  } catch (e: unknown) {
    console.error('Admin orders bulk-mark-delivered error:', e);
    return NextResponse.json(
      { success: false, message: 'Failed to update orders' },
      { status: 500 }
    );
  }
}
