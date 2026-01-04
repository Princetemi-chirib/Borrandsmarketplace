import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const items = await prisma.inventoryItem.findMany({
      where: { restaurantId: auth.restaurantId }
    });
    const low = items.filter(it => it.status === 'LOW_STOCK' || it.status === 'OUT_OF_STOCK');

    // WhatsApp notifications removed - inventory alerts functionality disabled
    // This can be converted to email notifications if needed in the future
    return NextResponse.json({ sent: 0, message: 'Inventory alerts via WhatsApp have been disabled' });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to send alerts' }, { status: 500 });
  }
}
