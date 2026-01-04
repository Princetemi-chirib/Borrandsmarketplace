import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';
import emitter from '@/lib/services/events';
import { sendOrderNotificationEmail } from '@/lib/services/email';

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
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
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
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();

    const body = await request.json();
    const nextStatus = (body.status || '').toUpperCase();
    if (!nextStatus || !ALLOWED_STATUSES.includes(nextStatus as any)) {
      console.error('Invalid status provided:', body.status, '->', nextStatus);
      return NextResponse.json({ message: `Invalid status: ${body.status || 'missing'}` }, { status: 400 });
    }

    // Get order with student info for email notification (single query)
    const order = await prisma.order.findFirst({
      where: { id: params.id, restaurantId: auth.restaurantId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    const prevStatus = order.status as OrderStatus;
    if (!isValidTransition(prevStatus, nextStatus as OrderStatus)) {
      console.error(`Invalid status transition: ${prevStatus} → ${nextStatus}`);
      return NextResponse.json({ message: `Invalid transition ${prevStatus} → ${nextStatus}` }, { status: 400 });
    }

    const updateData: any = { status: nextStatus };
    if (nextStatus === 'DELIVERED') updateData.actualDeliveryTime = new Date();
    
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData
    });

    // Send email notification to student for status updates (PREPARING, READY, PICKED_UP)
    if (order.student.email && ['PREPARING', 'READY', 'PICKED_UP'].includes(nextStatus)) {
      try {
        let items;
        try {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (parseError) {
          console.error('Failed to parse order items:', parseError);
          items = [];
        }
        const emailResult = await sendOrderNotificationEmail(
          order.student.email,
          order.student.name,
          order.orderNumber,
          nextStatus,
          {
            restaurantName: order.restaurant.name,
            total: order.total,
            deliveryAddress: order.deliveryAddress,
            items
          }
        );
        if (!emailResult.success) {
          console.error('Email sending failed:', emailResult.error);
        } else {
          console.log(`✅ Status update email sent to ${order.student.email} for order ${order.orderNumber}`);
        }
      } catch (error) {
        console.error('Failed to send status update email to student:', error);
        // Don't fail the request if email fails
      }
    }

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
    console.error('Error updating order:', e);
    console.error('Error details:', {
      message: e.message,
      stack: e.stack,
      orderId: params.id
    });
    return NextResponse.json({ message: e.message || 'Failed to update order' }, { status: 400 });
  }
}



