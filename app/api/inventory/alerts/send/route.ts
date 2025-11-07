import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InventoryItem from '@/lib/models/InventoryItem';
import { verifyAppRequest } from '@/lib/auth-app';
import { sendWhatsApp } from '@/lib/services/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const items = await InventoryItem.find({ restaurantId: auth.restaurantId }).lean();
    const low = items.filter((it: any) => it.status === 'low_stock' || it.status === 'out_of_stock');

    // TODO: Look up restaurant contact phone; using env fallback for now
    const toPhone = process.env.RESTAURANT_WHATSAPP_TO;
    if (!toPhone || low.length === 0) return NextResponse.json({ sent: 0 });

    let sent = 0;
    for (const it of low) {
      const body = it.status === 'out_of_stock'
        ? `⚠️ Stock alert: ${it.name} is OUT OF STOCK.`
        : `⚠️ Stock alert: ${it.name} is LOW (current: ${it.currentStock}, min: ${it.minStockLevel}).`;
      try { await sendWhatsApp(toPhone as string, body); sent++; } catch {}
    }
    return NextResponse.json({ sent });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to send alerts' }, { status: 500 });
  }
}















