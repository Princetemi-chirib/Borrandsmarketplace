import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const doc = await prisma.restaurant.findUnique({
      where: { id: auth.restaurantId },
      select: { operatingHours: true, deliveryFee: true, minimumOrder: true, estimatedDeliveryTime: true, features: true, paymentMethods: true }
    });
    if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ settings: doc });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await request.json();
    const allowed = ['operatingHours','deliveryFee','minimumOrder','estimatedDeliveryTime','features','paymentMethods'];
    const update: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) {
        // JSON stringify complex fields
        if (key === 'operatingHours' || key === 'features' || key === 'paymentMethods') {
          update[key] = typeof body[key] === 'string' ? body[key] : JSON.stringify(body[key]);
        } else {
          update[key] = body[key];
        }
      }
    }
    const doc = await prisma.restaurant.update({
      where: { id: auth.restaurantId },
      data: update,
      select: { operatingHours: true, deliveryFee: true, minimumOrder: true, estimatedDeliveryTime: true, features: true, paymentMethods: true }
    });
    if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ settings: doc });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to update settings' }, { status: 400 });
  }
}















