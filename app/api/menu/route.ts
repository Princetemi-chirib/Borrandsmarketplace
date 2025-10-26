import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { Types } from 'mongoose';
import { verifyAppRequest } from '@/lib/auth-app';
import Category from '@/lib/models/Category';
import Pack from '@/lib/models/Pack';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const restaurantId = auth.restaurantId;
    const items = await MenuItem.find({ restaurantId: new Types.ObjectId(restaurantId) })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load menu' }, { status: 500 });
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
    const { name, description, price, priceDescription, category, image, isAvailable, isPublished, packId, categoryId } = body;

    // Validate category/pack scoping
    if (categoryId) {
      const catOk = await Category.findOne({ _id: new Types.ObjectId(categoryId), restaurantId: new Types.ObjectId(restaurantId) }).select('_id');
      if (!catOk) return NextResponse.json({ message: 'Invalid categoryId' }, { status: 400 });
    }
    if (packId) {
      const packOk = await Pack.findOne({ _id: new Types.ObjectId(packId), restaurantId: new Types.ObjectId(restaurantId) }).select('_id');
      if (!packOk) return NextResponse.json({ message: 'Invalid packId' }, { status: 400 });
    }
    const item = await (MenuItem as any).create({
      restaurantId,
      name,
      description,
      price,
      priceDescription,
      image,
      isAvailable: Boolean(isAvailable),
      isPublished: isPublished !== false,
      packId: packId || undefined,
      categoryId: categoryId || undefined,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create item' }, { status: 400 });
  }
}

