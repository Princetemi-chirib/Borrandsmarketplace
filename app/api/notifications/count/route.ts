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
    const count = await prisma.order.count({
      where: {
        restaurantId: auth.restaurantId,
        status: 'PENDING'
      }
    });
    return NextResponse.json({ count });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to fetch notifications count' }, { status: 500 });
  }
}















