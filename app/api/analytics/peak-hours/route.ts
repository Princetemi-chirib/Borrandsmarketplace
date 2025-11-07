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
    const days = Math.min(parseInt(searchParams.get('days') || '7', 10), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await Order.aggregate([
      { $match: { restaurant: auth.restaurantId, createdAt: { $gte: since } } },
      { $project: { h: { $hour: '$createdAt' } } },
      { $group: { _id: '$h', orders: { $sum: 1 } } },
      { $project: { _id: 0, hour: { $concat: [ { $toString: '$_id' }, ':00' ] }, orders: 1 } },
      { $sort: { hour: 1 } }
    ]);

    return NextResponse.json({ peakHours: rows });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load peak hours' }, { status: 500 });
  }
}















