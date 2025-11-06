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
    const count = await Order.countDocuments({ restaurant: auth.restaurantId, status: 'pending' });
    return NextResponse.json({ count });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to fetch notifications count' }, { status: 500 });
  }
}













