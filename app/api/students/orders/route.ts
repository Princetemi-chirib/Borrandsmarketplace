import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import Restaurant from '@/lib/models/Restaurant';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

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

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    let query: any = { student: user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    // Get orders with restaurant details
    const orders = await Order.find(query)
      .populate('restaurant', 'name image address phone')
      .populate('rider', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
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

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
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
    const restaurant = await Restaurant.findById(restaurantId);
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
      const menuItem = restaurant.menu.find(menuItem => menuItem._id.toString() === item.itemId);
      if (!menuItem) {
        return NextResponse.json({ error: `Menu item ${item.name} not found` }, { status: 400 });
      }

      if (!menuItem.isAvailable) {
        return NextResponse.json({ error: `${menuItem.name} is currently unavailable` }, { status: 400 });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
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
    const order = new Order({
      student: user._id,
      restaurant: restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod,
      estimatedDeliveryTime: estimatedDeliveryTime || restaurant.estimatedDeliveryTime,
      status: 'pending',
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    await order.save();

    // Send notification to restaurant
    try {
      await sendWhatsAppNotification(
        restaurant.phone,
        `New order received! Order #${order.orderNumber} for ₦${total.toLocaleString()}. Please check your dashboard.`
      );
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }

    return NextResponse.json({ 
      message: 'Order created successfully',
      order: {
        _id: order._id,
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
