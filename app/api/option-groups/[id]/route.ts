import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OptionGroup from '@/lib/models/OptionGroup';
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
    const allowed = ['name', 'minSelect', 'maxSelect', 'options'];
    for (const key of allowed) if (key in body) update[key] = body[key];
    const group = await OptionGroup.findOneAndUpdate({ _id: new Types.ObjectId(id), restaurantId: new Types.ObjectId(auth.restaurantId) }, update, { new: true });
    if (!group) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ group });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to update option group' }, { status: 400 });
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
    const res = await OptionGroup.findOneAndDelete({ _id: new Types.ObjectId(id), restaurantId: new Types.ObjectId(auth.restaurantId) });
    if (!res) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to delete option group' }, { status: 400 });
  }
}

