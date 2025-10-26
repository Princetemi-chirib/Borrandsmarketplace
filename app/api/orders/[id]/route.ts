import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { Types } from 'mongoose';
import { verifyAppRequest } from '@/lib/auth-app';
import { sendWhatsApp, renderOrderTemplate } from '@/lib/services/whatsapp';
import emitter from '@/lib/services/events';

const ALLOWED_STATUSES = ['pending','accepted','preparing','ready','picked_up','delivered','cancelled'] as const;
type OrderStatus = typeof ALLOWED_STATUSES[number];

function isValidTransition(prev: OrderStatus, next: OrderStatus): boolean {
  const flow: Record<OrderStatus, OrderStatus[]> = {
    pending: ['accepted','cancelled'],
    accepted: ['preparing','cancelled'],
    preparing: ['ready','cancelled'],
    ready: ['picked_up','cancelled'],
    picked_up: ['delivered'],
    delivered: [],
    cancelled: [],
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
    const order = await Order.findOne({ _id: new Types.ObjectId(params.id), restaurant: new Types.ObjectId(auth.restaurantId) }).lean();
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
    const nextStatus = (body.status || '').toLowerCase();
    if (!ALLOWED_STATUSES.includes(nextStatus)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const order = await Order.findOne({ _id: new Types.ObjectId(params.id), restaurant: new Types.ObjectId(auth.restaurantId) });
    if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const prevStatus = order.status as OrderStatus;
    if (!isValidTransition(prevStatus, nextStatus as OrderStatus)) {
      return NextResponse.json({ message: `Invalid transition ${prevStatus} → ${nextStatus}` }, { status: 400 });
    }

    order.status = nextStatus as any;
    if (nextStatus === 'delivered') order.actualDeliveryTime = new Date();
    await order.save();

    // Send WhatsApp notification to customer if phone is available
    try {
      const customerPhone = (order as any).customerPhone || (order as any).deliveryPhone;
      if (customerPhone && order.orderNumber) {
        const tplMap: Record<string, any> = {
          accepted: 'order_confirmed',
          preparing: 'order_preparing',
          ready: 'order_ready',
          picked_up: 'order_picked_up',
          delivered: 'order_delivered',
          cancelled: 'order_cancelled',
        };
        const tpl = tplMap[nextStatus];
        if (tpl) {
          const msg = renderOrderTemplate(tpl, { orderNumber: order.orderNumber, restaurantName: undefined });
          await sendWhatsApp(customerPhone, msg);
        }
      }
    } catch {}

    // Emit SSE event to restaurant listeners
    try {
      emitter.emit('order.updated', {
        restaurantId: String(order.restaurant),
        orderId: String(order._id),
        status: order.status,
        updatedAt: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({ order });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to update order' }, { status: 400 });
  }
}



