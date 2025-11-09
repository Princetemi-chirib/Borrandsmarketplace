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
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'RIDER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get rider profile
    const rider = await prisma.rider.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    // Get active deliveries (assigned to this rider, not yet delivered)
    const activeDeliveries = await prisma.order.findMany({
      where: {
        riderId: rider.id,
        status: {
          in: ['READY', 'PICKED_UP'] // Active statuses
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
        createdAt: 'asc'
      }
    });

    // Transform deliveries for frontend
    const transformedDeliveries = activeDeliveries.map(order => ({
      _id: order.id,
      id: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      restaurantName: order.restaurant.name,
      restaurantPhone: order.restaurant.phone,
      studentName: order.student.name,
      studentPhone: order.student.phone,
      status: order.status.toLowerCase(),
      total: order.total,
      deliveryFee: order.deliveryFee,
      earnings: order.deliveryFee,
      pickupAddress: order.restaurant.address,
      deliveryAddress: order.deliveryAddress,
      deliveryInstructions: order.deliveryInstructions,
      createdAt: order.createdAt.toISOString(),
      estimatedPickupTime: order.createdAt.toISOString(), // TODO: Calculate actual ETA
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      distance: 0 // TODO: Calculate distance
    }));

    return NextResponse.json({
      success: true,
      deliveries: transformedDeliveries,
      count: transformedDeliveries.length
    });
  } catch (error: any) {
    console.error('Error fetching active deliveries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active deliveries' },
      { status: 500 }
    );
  }
}

