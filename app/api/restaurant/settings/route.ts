import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/lib/models/Restaurant';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const doc = await Restaurant.findById(auth.restaurantId).select('operatingHours deliveryFee minimumOrder estimatedDeliveryTime features paymentMethods').lean();
    if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ settings: doc });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await request.json();
    const allowed = ['operatingHours','deliveryFee','minimumOrder','estimatedDeliveryTime','features','paymentMethods'];
    const update: Record<string, any> = {};
    for (const key of allowed) if (key in body) update[key] = body[key];
    const doc = await Restaurant.findByIdAndUpdate(auth.restaurantId, update, { new: true, runValidators: true }).select('operatingHours deliveryFee minimumOrder estimatedDeliveryTime features paymentMethods');
    if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ settings: doc });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to update settings' }, { status: 400 });
  }
}










