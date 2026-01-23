import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const orderId = params.id;

    // Get order with restaurant details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          select: { id: true, name: true, image: true, logo: true, address: true, phone: true }
        },
        student: {
          select: { id: true, name: true, phone: true }
        },
        rider: {
          select: { id: true, name: true, phone: true, email: true }
        }
      }
    });

    if (!order) {
      console.error(`Order not found: ${orderId} for user: ${user.id}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if the order belongs to the student
    if (order.studentId !== user.id) {
      console.error(`Access denied: Order ${orderId} belongs to student ${order.studentId}, but user is ${user.id}`);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ order: { ...order, _id: order.id } });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const orderId = params.id;
    const body = await request.json();
    const { action, rating, review } = body;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if the order belongs to the student
    if (order.studentId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Handle different actions
    switch (action) {
      case 'cancel':
        if (order.status === 'PENDING' || order.status === 'ACCEPTED') {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date()
            }
          });
          return NextResponse.json({ message: 'Order cancelled successfully' });
        } else {
          return NextResponse.json({ error: 'Order cannot be cancelled at this stage' }, { status: 400 });
        }

      case 'complete':
        // Student marks order as received/completed
        if (order.status === 'PICKED_UP') {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'DELIVERED',
              actualDeliveryTime: new Date()
            }
          });
          return NextResponse.json({ message: 'Order marked as received successfully' });
        } else if (order.status === 'DELIVERED') {
          return NextResponse.json({ error: 'Order has already been marked as delivered' }, { status: 400 });
        } else {
          return NextResponse.json({ error: 'Order can only be marked as received if it has been picked up' }, { status: 400 });
        }

      case 'rate':
        if (order.status === 'DELIVERED' && !order.rating) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              rating: rating,
              review: review || '',
              ratedAt: new Date()
            }
          });
          return NextResponse.json({ message: 'Order rated successfully' });
        } else {
          return NextResponse.json({ error: 'Order cannot be rated at this stage' }, { status: 400 });
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
