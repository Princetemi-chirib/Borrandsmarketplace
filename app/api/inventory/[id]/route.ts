import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

function computeStatus(current: number, min: number): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
  if (current <= 0) return 'OUT_OF_STOCK';
  if (current < min) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const body = await request.json();
    const allowed = ['name','category','currentStock','minStockLevel','maxStockLevel','unit','costPerUnit','lastRestocked','supplier','expiryDate','location'] as const;
    const update: Record<string, any> = {};
    for (const key of allowed) if (key in body) update[key] = body[key];
    
    if ('currentStock' in update || 'minStockLevel' in update) {
      const doc = await prisma.inventoryItem.findFirst({
        where: { id: params.id, restaurantId: auth.restaurantId }
      });
      if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
      const current = 'currentStock' in update ? update.currentStock : doc.currentStock;
      const min = 'minStockLevel' in update ? update.minStockLevel : doc.minStockLevel;
      update.status = computeStatus(current, min);
    }
    
    const result = await prisma.inventoryItem.updateMany({
      where: { id: params.id, restaurantId: auth.restaurantId },
      data: update
    });
    
    if (result.count === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    
    const item = await prisma.inventoryItem.findUnique({ where: { id: params.id } });

    // Basic menu linkage: auto-toggle related menu items based on inventory status
    // We link by restaurantId + item name. When stock is 0 => mark menu item unavailable.
    if (item) {
      const newStatus = item.status; // InventoryStatus enum: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
      if (newStatus === 'OUT_OF_STOCK') {
        // Mark matching menu items as unavailable
        await prisma.menuItem.updateMany({
          where: {
            restaurantId: auth.restaurantId,
            name: item.name
          },
          data: { isAvailable: false }
        });
      } else if (newStatus === 'IN_STOCK' || newStatus === 'LOW_STOCK') {
        // Ensure matching menu items are available when stock returns
        await prisma.menuItem.updateMany({
          where: {
            restaurantId: auth.restaurantId,
            name: item.name
          },
          data: { isAvailable: true }
        });
      }
    }

    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to update item' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const res = await prisma.inventoryItem.deleteMany({
      where: { id: params.id, restaurantId: auth.restaurantId }
    });
    if (res.count === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to delete item' }, { status: 400 });
  }
}















