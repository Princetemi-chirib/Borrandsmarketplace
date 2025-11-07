import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
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

    const rows = await Order.aggregate([
      { $match: { restaurant: auth.restaurantId, createdAt: { $gte: since }, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', orders: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $project: { _id: 0, name: '$_id', orders: 1, revenue: 1 } },
      { $sort: { orders: -1 } },
      { $limit: limit }
    ]);

    return NextResponse.json({ topItems: rows });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load top items' }, { status: 500 });
  }
}















