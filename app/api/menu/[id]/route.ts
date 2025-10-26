import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { Types } from 'mongoose';
import { verifyAppRequest } from '@/lib/auth-app';
import Category from '@/lib/models/Category';
import Pack from '@/lib/models/Pack';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const id = params.id;
    const body = await request.json();
    const update: Record<string, any> = {};
    const allowed = ['name', 'description', 'price', 'priceDescription', 'image', 'isAvailable', 'isPublished', 'sortOrder', 'packId', 'categoryId'];
    for (const key of allowed) if (key in body) update[key] = body[key];

    if (update.categoryId) {
      const catOk = await Category.findOne({ _id: new Types.ObjectId(update.categoryId), restaurantId: new Types.ObjectId(auth.restaurantId) }).select('_id');
      if (!catOk) return NextResponse.json({ message: 'Invalid categoryId' }, { status: 400 });
    }
    if (update.packId) {
      const packOk = await Pack.findOne({ _id: new Types.ObjectId(update.packId), restaurantId: new Types.ObjectId(auth.restaurantId) }).select('_id');
      if (!packOk) return NextResponse.json({ message: 'Invalid packId' }, { status: 400 });
    }
    const item = await MenuItem.findOneAndUpdate({ _id: new Types.ObjectId(id), restaurantId: new Types.ObjectId(auth.restaurantId) }, update, { new: true });
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to update item' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const id = params.id;
    const res = await MenuItem.findOneAndDelete({ _id: new Types.ObjectId(id), restaurantId: new Types.ObjectId(auth.restaurantId) });
    if (!res) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to delete item' }, { status: 400 });
  }
}

