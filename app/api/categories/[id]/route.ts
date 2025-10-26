import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import { Types } from 'mongoose';
import { verifyAppRequest } from '@/lib/auth-app';

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
    const allowed = ['name', 'description', 'isActive', 'sortOrder'];
    for (const key of allowed) if (key in body) update[key] = body[key];
    const category = await Category.findOneAndUpdate({ _id: new Types.ObjectId(id), restaurantId: new Types.ObjectId(auth.restaurantId) }, update, { new: true });
    if (!category) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ category });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to update category' }, { status: 400 });
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
    const res = await Category.findOneAndDelete({ _id: new Types.ObjectId(id), restaurantId: new Types.ObjectId(auth.restaurantId) });
    if (!res) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to delete category' }, { status: 400 });
  }
}

