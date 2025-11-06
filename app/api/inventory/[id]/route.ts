import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InventoryItem from '@/lib/models/InventoryItem';
import { Types } from 'mongoose';
import { verifyAppRequest } from '@/lib/auth-app';

function computeStatus(current: number, min: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (current <= 0) return 'out_of_stock';
  if (current < min) return 'low_stock';
  return 'in_stock';
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const body = await request.json();
    const allowed = ['name','category','currentStock','minStockLevel','maxStockLevel','unit','costPerUnit','lastRestocked','supplier','expiryDate','location'] as const;
    const update: Record<string, any> = {};
    for (const key of allowed) if (key in body) update[key] = body[key];
    if ('currentStock' in update || 'minStockLevel' in update) {
      const doc = await InventoryItem.findOne({ _id: new Types.ObjectId(params.id), restaurantId: auth.restaurantId });
      if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
      const current = 'currentStock' in update ? update.currentStock : doc.currentStock;
      const min = 'minStockLevel' in update ? update.minStockLevel : doc.minStockLevel;
      update.status = computeStatus(current, min);
    }
    const item = await InventoryItem.findOneAndUpdate({ _id: new Types.ObjectId(params.id), restaurantId: auth.restaurantId }, update, { new: true });
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to update item' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const res = await InventoryItem.findOneAndDelete({ _id: new Types.ObjectId(params.id), restaurantId: auth.restaurantId });
    if (!res) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to delete item' }, { status: 400 });
  }
}













