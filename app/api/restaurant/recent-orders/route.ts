import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Get recent orders
    const orders = await prisma.order.findMany({
      where: { restaurantId: auth.restaurantId },
      include: {
        student: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Transform orders
    const transformedOrders = orders.map(order => ({
      _id: order.id,
      id: order.id,
      orderNumber: order.orderNumber,
      studentName: order.student?.name || 'Unknown',
      status: order.status?.toLowerCase() || 'pending',
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      deliveryAddress: order.deliveryAddress,
      paymentStatus: order.paymentStatus?.toLowerCase() || 'pending',
      paymentMethod: order.paymentMethod?.toLowerCase() || 'cash'
    }));

    return NextResponse.json({
      success: true,
      orders: transformedOrders
    });
  } catch (error: any) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json(
      { message: 'Failed to fetch recent orders' },
      { status: 500 }
    );
  }
}

