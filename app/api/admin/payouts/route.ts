import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';

const DEFAULT_DAYS = 90;
const MAX_DAYS = 365;

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** GET /api/admin/payouts – list restaurants with unpaid daily food revenue and payout details (admin only) */
export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const days = Math.min(
      Math.max(1, parseInt(searchParams.get('days') || String(DEFAULT_DAYS), 10)),
      MAX_DAYS
    );
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    // Restaurants (approved/active) with payout fields
    const restaurants = await prisma.restaurant.findMany({
      where: {
        status: { in: ['APPROVED', 'approved', 'active'] },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        payoutBankName: true,
        payoutAccountNumber: true,
        payoutAccountName: true
      },
      orderBy: { name: 'asc' }
    });

    // Daily food revenue per restaurant: orders DELIVERED + PAID, sum(subtotal) by date
    const orders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        createdAt: { gte: since }
      },
      select: { restaurantId: true, subtotal: true, createdAt: true }
    });

    const dailyRevenueByRestaurant = new Map<string, Map<string, number>>();
    for (const o of orders) {
      const key = toDateKey(o.createdAt);
      if (!dailyRevenueByRestaurant.has(o.restaurantId)) {
        dailyRevenueByRestaurant.set(o.restaurantId, new Map());
      }
      const dayMap = dailyRevenueByRestaurant.get(o.restaurantId)!;
      dayMap.set(key, (dayMap.get(key) || 0) + (o.subtotal ?? 0));
    }

    // Payouts per restaurant by date (so we know which days are already paid)
    const payouts = await prisma.restaurantPayout.findMany({
      where: { payoutDate: { gte: since } },
      select: { restaurantId: true, payoutDate: true, amount: true, paidAt: true, paidBy: true },
      orderBy: { paidAt: 'desc' }
    });

    const paidDatesByRestaurant = new Map<string, Set<string>>();
    const recentPayoutsByRestaurant = new Map<string, Array<{ payoutDate: string; amount: number; paidAt: string; paidBy: string | null }>>();
    for (const p of payouts) {
      const key = toDateKey(p.payoutDate);
      if (!paidDatesByRestaurant.has(p.restaurantId)) {
        paidDatesByRestaurant.set(p.restaurantId, new Set());
      }
      paidDatesByRestaurant.get(p.restaurantId)!.add(key);

      if (!recentPayoutsByRestaurant.has(p.restaurantId)) {
        recentPayoutsByRestaurant.set(p.restaurantId, []);
      }
      const arr = recentPayoutsByRestaurant.get(p.restaurantId)!;
      if (arr.length < 20) {
        arr.push({
          payoutDate: key,
          amount: p.amount,
          paidAt: p.paidAt.toISOString(),
          paidBy: p.paidBy
        });
      }
    }

    const result = restaurants.map((r) => {
      const dayRevenue = dailyRevenueByRestaurant.get(r.id);
      const paidDates = paidDatesByRestaurant.get(r.id) || new Set<string>();
      const unpaidDays: Array<{ date: string; amount: number }> = [];
      if (dayRevenue) {
        for (const [date, amount] of dayRevenue.entries()) {
          if (!paidDates.has(date) && amount > 0) {
            unpaidDays.push({ date, amount });
          }
        }
      }
      unpaidDays.sort((a, b) => b.date.localeCompare(a.date));

      return {
        id: r.id,
        name: r.name,
        payoutBankName: r.payoutBankName || '',
        payoutAccountNumber: r.payoutAccountNumber || '',
        payoutAccountName: r.payoutAccountName || '',
        unpaidDays,
        recentPayouts: recentPayoutsByRestaurant.get(r.id) || []
      };
    });

    return NextResponse.json({
      success: true,
      restaurants: result,
      from: toDateKey(since),
      days
    });
  } catch (e) {
    console.error('Admin payouts GET error:', e);
    return NextResponse.json(
      { success: false, message: 'Failed to load payouts' },
      { status: 500 }
    );
  }
}

/** POST /api/admin/payouts – mark a day as paid (admin only) */
export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { restaurantId, date, amount } = body as { restaurantId?: string; date?: string; amount?: number };

    if (!restaurantId || !date) {
      return NextResponse.json(
        { success: false, message: 'restaurantId and date are required' },
        { status: 400 }
      );
    }

    const payoutDate = new Date(date);
    if (isNaN(payoutDate.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date' },
        { status: 400 }
      );
    }
    payoutDate.setHours(0, 0, 0, 0);

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

    const amountToRecord = typeof amount === 'number' && amount >= 0 ? amount : 0;

    await prisma.restaurantPayout.create({
      data: {
        restaurantId,
        payoutDate,
        amount: amountToRecord,
        paidBy: payload.userId || null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Marked as paid'
    });
  } catch (e) {
    console.error('Admin payouts POST error:', e);
    return NextResponse.json(
      { success: false, message: 'Failed to record payout' },
      { status: 500 }
    );
  }
}
