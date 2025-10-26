import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import { Types } from 'mongoose';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const restaurantId = auth.restaurantId;
    const categories = await Category.find({ restaurantId: new Types.ObjectId(restaurantId) })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ categories });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load categories' }, { status: 500 });
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
    const { name, description, isActive } = body;
    const category = await (Category as any).create({ restaurantId, name, description, isActive: Boolean(isActive) });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create category' }, { status: 400 });
  }
}
