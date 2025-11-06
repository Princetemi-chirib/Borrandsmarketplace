import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
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

    // Only paid/completed revenue should count
    const match: any = { restaurant: auth.restaurantId, createdAt: { $gte: since } };

    const [agg] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] } },
          totalOrders: { $sum: 1 },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          customers: { $addToSet: '$student' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrders: 1,
          averageOrderValue: { $cond: [{ $gt: ['$totalOrders', 0] }, { $divide: ['$totalRevenue', '$totalOrders'] }, 0] },
          completionRate: { $cond: [{ $gt: ['$totalOrders', 0] }, { $multiply: [{ $divide: ['$deliveredOrders', '$totalOrders'] }, 100] }, 0] },
          customerCount: { $size: '$customers' }
        }
      }
    ]);

    const data = agg || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, completionRate: 0, customerCount: 0 };
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load analytics summary' }, { status: 500 });
  }
}













