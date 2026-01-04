import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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
      select: { id: true, role: true, name: true, phone: true }
    });
    
    if (!user || user.role !== 'RIDER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get rider profile
    const rider = await prisma.rider.findUnique({
      where: { userId: user.id },
      select: { 
        id: true, 
        isOnline: true, 
        isAvailable: true,
        name: true,
        phone: true
      }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    if (!rider.isOnline || !rider.isAvailable) {
      return NextResponse.json({ 
        error: 'You must be online and available to accept orders' 
      }, { status: 400 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get order details
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

    // Check if order is available (READY status and no rider assigned)
    if (order.status !== 'READY') {
      return NextResponse.json({ 
        error: 'Order is not ready for pickup' 
      }, { status: 400 });
    }

    if (order.riderId) {
      return NextResponse.json({ 
        error: 'Order has already been assigned to another rider' 
      }, { status: 400 });
    }

    // Assign order to rider
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        riderId: rider.id
        // Status remains READY until rider picks it up
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Order accepted successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status
      }
    });
  } catch (error: any) {
    console.error('Error accepting order:', error);
    return NextResponse.json(
      { error: 'Failed to accept order' },
      { status: 500 }
    );
  }
}

