import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build where clause
    const where: any = {};
    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Get orders with related data
    const orders = await prisma.order.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Transform orders
    const transformedOrders = orders.map(order => ({
      _id: order.id,
      id: order.id,
      orderNumber: order.orderNumber,
      restaurant: order.restaurant,
      student: order.student,
      rider: order.rider,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      deliveryAddress: order.deliveryAddress,
      deliveryInstructions: order.deliveryInstructions,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      rejectedAt: order.rejectedAt?.toISOString(),
      rejectionReason: order.rejectionReason
    }));

    return NextResponse.json({ 
      success: true, 
      orders: transformedOrders 
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to fetch orders' 
    }, { status: 500 });
  }
}



