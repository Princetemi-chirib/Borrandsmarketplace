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
    const items = await InventoryItem.find({ restaurantId: auth.restaurantId }).lean();
    const alerts = items
      .filter((it: any) => it.status === 'low_stock' || it.status === 'out_of_stock')
      .map((it: any) => ({
        _id: String(it._id),
        itemName: it.name,
        currentStock: it.currentStock,
        minLevel: it.minStockLevel,
        priority: it.status === 'out_of_stock' ? 'high' : 'medium',
        daysUntilOut: it.status === 'out_of_stock' ? 0 : undefined,
      }));
    return NextResponse.json({ alerts });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load alerts' }, { status: 500 });
  }
}















