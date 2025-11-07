import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';
import WhatsApp from '@/lib/whatsapp';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = { studentId: user.id };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Get orders with restaurant details
    const orders = await prisma.order.findMany({
      where,
      include: {
        restaurant: {
          select: { id: true, name: true, image: true, address: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.order.count({ where });

    return NextResponse.json({
      orders: orders.map(o => ({ ...o, _id: o.id })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const {
      restaurantId,
      items,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod,
      estimatedDeliveryTime
    } = await request.json();

    // Validate required fields
    if (!restaurantId || !items || !deliveryAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if restaurant exists and is open
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });
    
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    if (!restaurant.isOpen) {
      return NextResponse.json({ error: 'Restaurant is currently closed' }, { status: 400 });
    }

    // Calculate order total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // In real implementation, you'd fetch menu items from MenuItem table
      // For now, we'll use the items as provided
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    const deliveryFee = restaurant.deliveryFee;
    const total = subtotal + deliveryFee;

    // Check minimum order
    if (subtotal < restaurant.minimumOrder) {
      return NextResponse.json({ 
        error: `Minimum order amount is ₦${restaurant.minimumOrder}` 
      }, { status: 400 });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        studentId: user.id,
        restaurantId: restaurantId,
        items: JSON.stringify(orderItems),
        subtotal,
        deliveryFee,
        total,
        deliveryAddress,
        deliveryInstructions: deliveryInstructions || '',
        paymentMethod: paymentMethod || 'CASH',
        estimatedDeliveryTime: estimatedDeliveryTime || restaurant.estimatedDeliveryTime,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }
    });

    // Send notification to restaurant
    try {
      await WhatsApp.sendMessage(
        restaurant.phone,
        `New order received! Order #${order.orderNumber} for ₦${total.toLocaleString()}. Please check your dashboard.`
      );
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }

    return NextResponse.json({ 
      message: 'Order created successfully',
      order: {
        _id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
