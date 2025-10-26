import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';

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

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const orderId = params.id;

    // Get order with restaurant and rider details
    const order = await Order.findById(orderId)
      .populate('restaurant', 'name image address phone')
      .populate('rider', 'name phone vehicleNumber')
      .populate('student', 'name phone');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if the order belongs to the student
    if (order.student._id.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ order });
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

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const orderId = params.id;
    const { action } = await request.json();

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if the order belongs to the student
    if (order.student.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Handle different actions
    switch (action) {
      case 'cancel':
        if (order.status === 'pending' || order.status === 'accepted') {
          order.status = 'cancelled';
          order.cancelledAt = new Date();
          await order.save();
          return NextResponse.json({ message: 'Order cancelled successfully' });
        } else {
          return NextResponse.json({ error: 'Order cannot be cancelled at this stage' }, { status: 400 });
        }
        break;

      case 'rate':
        const { rating, review } = await request.json();
        if (order.status === 'delivered' && !order.rating) {
          order.rating = rating;
          order.review = review;
          order.ratedAt = new Date();
          await order.save();
          return NextResponse.json({ message: 'Order rated successfully' });
        } else {
          return NextResponse.json({ error: 'Order cannot be rated at this stage' }, { status: 400 });
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
