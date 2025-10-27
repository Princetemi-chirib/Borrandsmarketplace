import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InventoryItem from '@/lib/models/InventoryItem';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const items = await InventoryItem.find({ restaurantId: auth.restaurantId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const body = await request.json();
    const item = await (InventoryItem as any).create({ ...body, restaurantId: auth.restaurantId });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create item' }, { status: 400 });
  }
}











