import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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
      select: { id: true, role: true, university: true }
    });
    
    if (!user || user.role !== 'RIDER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get rider profile to check online status
    const rider = await prisma.rider.findUnique({
      where: { userId: user.id },
      select: { id: true, isOnline: true, isAvailable: true, university: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    // Get orders that are READY for pickup and not yet assigned to a rider
    // Only show orders from the same university
    const availableOrders = await prisma.order.findMany({
      where: {
        status: 'READY',
        riderId: null, // Not yet assigned
        restaurant: {
          university: user.university // Same university
        }
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            image: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Oldest first (FIFO)
      },
      take: 20 // Limit to 20 orders
    });

    // Transform orders for frontend
    const transformedOrders = availableOrders.map(order => ({
      _id: order.id,
      id: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      restaurantName: order.restaurant.name,
      studentName: order.student.name,
      studentPhone: order.student.phone,
      status: order.status.toLowerCase(),
      total: order.total,
      deliveryFee: order.deliveryFee,
      earnings: order.deliveryFee, // Rider's earnings is the delivery fee
      pickupAddress: order.restaurant.address,
      deliveryAddress: order.deliveryAddress,
      deliveryInstructions: order.deliveryInstructions,
      createdAt: order.createdAt.toISOString(),
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      distance: 0 // TODO: Calculate distance based on addresses
    }));

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      count: transformedOrders.length
    });
  } catch (error: any) {
    console.error('Error fetching available orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available orders' },
      { status: 500 }
    );
  }
}

