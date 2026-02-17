import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

/**
 * POST /api/admin/payouts/mark-all-for-date
 * Mark as paid for all restaurants for a single day (admin only).
 * Body: { date: "YYYY-MM-DD" }
 * Creates one RestaurantPayout per restaurant that has unpaid revenue on that date.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { date: dateStr } = body as { date?: string };

    if (!dateStr || typeof dateStr !== 'string') {
      return NextResponse.json(
        { success: false, message: 'date is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const payoutDate = new Date(dateStr);
    if (isNaN(payoutDate.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date' },
        { status: 400 }
      );
    }
    payoutDate.setHours(0, 0, 0, 0);
    const dateKey = toDateKey(payoutDate);

    const dayStart = new Date(payoutDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(payoutDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Daily food revenue per restaurant for this day: orders DELIVERED + PAID, sum(subtotal)
    const orders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        createdAt: { gte: dayStart, lte: dayEnd }
      },
      select: { restaurantId: true, subtotal: true }
    });

    const revenueByRestaurant = new Map<string, number>();
    for (const o of orders) {
      const current = revenueByRestaurant.get(o.restaurantId) || 0;
      revenueByRestaurant.set(o.restaurantId, current + (o.subtotal ?? 0));
    }

    // Existing payouts for this date
    const existingPayouts = await prisma.restaurantPayout.findMany({
      where: {
        payoutDate: { gte: dayStart, lte: dayEnd }
      },
      select: { restaurantId: true }
    });
    const paidRestaurantIds = new Set(existingPayouts.map((p) => p.restaurantId));

    // Only create payouts for restaurants with revenue and no payout yet for this date
    const toCreate: Array<{ restaurantId: string; amount: number }> = [];
    for (const [restaurantId, amount] of Array.from(revenueByRestaurant.entries())) {
      if (amount > 0 && !paidRestaurantIds.has(restaurantId)) {
        toCreate.push({ restaurantId, amount });
      }
    }

    const paidBy = payload.userId || null;

    for (const { restaurantId, amount } of toCreate) {
      await prisma.restaurantPayout.create({
        data: {
          restaurantId,
          payoutDate,
          amount,
          paidBy
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Marked as paid for ${toCreate.length} restaurant(s) for ${dateKey}`,
      count: toCreate.length,
      date: dateKey
    });
  } catch (e) {
    console.error('Admin payouts mark-all-for-date error:', e);
    return NextResponse.json(
      { success: false, message: 'Failed to record payouts' },
      { status: 500 }
    );
  }
}
