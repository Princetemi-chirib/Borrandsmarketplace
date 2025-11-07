import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const items = await prisma.inventoryItem.findMany({
      where: { restaurantId: auth.restaurantId }
    });
    const alerts = items
      .filter(it => it.status === 'LOW_STOCK' || it.status === 'OUT_OF_STOCK')
      .map(it => ({
        id: it.id,
        itemName: it.name,
        currentStock: it.currentStock,
        minLevel: it.minStockLevel,
        priority: it.status === 'OUT_OF_STOCK' ? 'HIGH' : 'MEDIUM',
        daysUntilOut: it.status === 'OUT_OF_STOCK' ? 0 : undefined,
      }));
    return NextResponse.json({ alerts });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load alerts' }, { status: 500 });
  }
}















