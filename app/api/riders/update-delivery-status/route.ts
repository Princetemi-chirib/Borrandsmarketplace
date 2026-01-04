import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';
import emitter from '@/lib/services/events';

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user and verify role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'RIDER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get rider profile
    const rider = await prisma.rider.findUnique({
      where: { userId: user.id },
      select: { id: true, name: true, phone: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ 
        error: 'Order ID and status are required' 
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['PICKED_UP', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be PICKED_UP or DELIVERED' 
      }, { status: 400 });
    }

    // Get order and verify it belongs to this rider
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          select: { name: true, phone: true }
        },
        student: {
          select: { name: true, phone: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.riderId !== rider.id) {
      return NextResponse.json({ 
        error: 'This order is not assigned to you' 
      }, { status: 403 });
    }

    // Update order status
    const updateData: any = { status };
    
    // If marking as delivered, update actualDeliveryTime and rider stats
    if (status === 'DELIVERED') {
      updateData.actualDeliveryTime = new Date();
      
      // Update rider stats
      await prisma.rider.update({
        where: { id: rider.id },
        data: {
          totalDeliveries: { increment: 1 },
          totalEarnings: { increment: order.deliveryFee }
        }
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    // Emit SSE event for real-time updates
    emitter.emit('orderUpdate', {
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      riderId: rider.id
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        actualDeliveryTime: updatedOrder.actualDeliveryTime
      }
    });
  } catch (error: any) {
    console.error('Error updating delivery status:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery status' },
      { status: 500 }
    );
  }
}

