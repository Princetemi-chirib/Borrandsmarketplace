import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';
import { sendWhatsApp } from '@/lib/services/whatsapp';

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

    // TODO: Look up restaurant contact phone; using env fallback for now
    const toPhone = process.env.RESTAURANT_WHATSAPP_TO;
    if (!toPhone || low.length === 0) return NextResponse.json({ sent: 0 });

    let sent = 0;
    for (const it of low) {
      const body = it.status === 'OUT_OF_STOCK'
        ? `⚠️ Stock alert: ${it.name} is OUT OF STOCK.`
        : `⚠️ Stock alert: ${it.name} is LOW (current: ${it.currentStock}, min: ${it.minStockLevel}).`;
      try { await sendWhatsApp(toPhone as string, body); sent++; } catch {}
    }
    return NextResponse.json({ sent });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to send alerts' }, { status: 500 });
  }
}















