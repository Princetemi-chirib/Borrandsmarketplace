import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';
import { sendWhatsApp, renderOrderTemplate } from '@/lib/services/whatsapp';
import emitter from '@/lib/services/events';

const ALLOWED_STATUSES = ['PENDING','ACCEPTED','PREPARING','READY','PICKED_UP','DELIVERED','CANCELLED'] as const;
type OrderStatus = typeof ALLOWED_STATUSES[number];

function isValidTransition(prev: OrderStatus, next: OrderStatus): boolean {
  const flow: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['ACCEPTED','CANCELLED'],
    ACCEPTED: ['PREPARING','CANCELLED'],
    PREPARING: ['READY','CANCELLED'],
    READY: ['PICKED_UP','CANCELLED'],
    PICKED_UP: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };
  return flow[prev]?.includes(next) || false;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const order = await prisma.order.findFirst({
      where: { id: params.id, restaurantId: auth.restaurantId }
    });
    if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();

    const body = await request.json();
    const nextStatus = (body.status || '').toUpperCase();
    if (!ALLOWED_STATUSES.includes(nextStatus as any)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: params.id, restaurantId: auth.restaurantId }
    });
    if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const prevStatus = order.status as OrderStatus;
    if (!isValidTransition(prevStatus, nextStatus as OrderStatus)) {
      return NextResponse.json({ message: `Invalid transition ${prevStatus} → ${nextStatus}` }, { status: 400 });
    }

    const updateData: any = { status: nextStatus };
    if (nextStatus === 'DELIVERED') updateData.actualDeliveryTime = new Date();
    
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData
    });

    // Send WhatsApp notification to customer if phone is available
    try {
      const customerPhone = (updatedOrder as any).customerPhone || (updatedOrder as any).deliveryPhone;
      if (customerPhone && updatedOrder.orderNumber) {
        const tplMap: Record<string, any> = {
          ACCEPTED: 'order_confirmed',
          PREPARING: 'order_preparing',
          READY: 'order_ready',
          PICKED_UP: 'order_picked_up',
          DELIVERED: 'order_delivered',
          CANCELLED: 'order_cancelled',
        };
        const tpl = tplMap[nextStatus];
        if (tpl) {
          const msg = renderOrderTemplate(tpl, { orderNumber: updatedOrder.orderNumber, restaurantName: undefined });
          await sendWhatsApp(customerPhone, msg);
        }
      }
    } catch {}

    // Emit SSE event to restaurant listeners
    try {
      emitter.emit('order.updated', {
        restaurantId: updatedOrder.restaurantId,
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({ order: updatedOrder });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to update order' }, { status: 400 });
  }
}



