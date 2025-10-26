import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pack from '@/lib/models/Pack';
import { Types } from 'mongoose';
import { verifyAppRequest } from '@/lib/auth-app';

async function getRestaurantId() {
  return process.env.DEMO_RESTAURANT_ID || '000000000000000000000000';
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const restaurantId = auth.restaurantId;
    const packs = await Pack.find({ restaurantId: new Types.ObjectId(restaurantId) })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ packs });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load packs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const restaurantId = auth.restaurantId;
    const body = await request.json();
    const { name, description, price, isActive } = body;
    const pack = await (Pack as any).create({ restaurantId, name, description, price, isActive: Boolean(isActive) });
    return NextResponse.json({ pack }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create pack' }, { status: 400 });
  }
}
