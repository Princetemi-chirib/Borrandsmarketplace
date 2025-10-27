import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';
import Restaurant from '@/lib/models/Restaurant';
import { Types } from 'mongoose';
import { verifyAppRequest } from '@/lib/auth-app';

const ALLOWED_STATUSES = new Set(['pending','accepted','preparing','ready','picked_up','delivered','cancelled']);

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'all').toLowerCase();
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const query: any = { restaurant: auth.restaurantId };
    if (status !== 'all' && ALLOWED_STATUSES.has(status)) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ orders });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load orders' }, { status: 500 });
  }
}

// Create a new order (student checkout)
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'student' || !auth.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { restaurantId, items, deliveryAddress, deliveryInstructions, paymentMethod } = body || {};

    if (!restaurantId || !Array.isArray(items) || items.length === 0 || !deliveryAddress || !paymentMethod) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const restaurant = await Restaurant.findOne({ _id: new Types.ObjectId(restaurantId), isApproved: true, isActive: true }).select('_id estimatedDeliveryTime').lean() as any;
    if (!restaurant) return NextResponse.json({ message: 'Restaurant not found or inactive' }, { status: 404 });

    // Load item prices from DB to prevent tampering
    const itemIds = items.map((it: any) => new Types.ObjectId(it.itemId));
    const dbItems = await MenuItem.find({ _id: { $in: itemIds }, restaurantId: restaurant._id, isPublished: true }).select('name price').lean();
    const idToItem = new Map(dbItems.map((it: any) => [String(it._id), it]));

    const normalizedItems = items.map((it: any) => {
      const db = idToItem.get(String(it.itemId));
      if (!db) return null;
      const quantity = Math.max(1, Number(it.quantity || 1));
      const price = Number(db.price || 0);
      return {
        itemId: new Types.ObjectId(it.itemId),
        name: db.name,
        price,
        quantity,
        total: price * quantity,
        specialInstructions: it.specialInstructions || undefined,
      };
    }).filter(Boolean);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ message: 'No valid items' }, { status: 400 });
    }

    const subtotal = normalizedItems.reduce((sum: number, it: any) => sum + it.total, 0);
    const SERVICE_CHARGE = 150;
    const DELIVERY_FEE = 500;
    const total = subtotal + SERVICE_CHARGE + DELIVERY_FEE;

    const order = await (Order as any).create({
      student: new Types.ObjectId(auth.sub),
      restaurant: restaurant._id,
      items: normalizedItems,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      deliveryAddress,
      deliveryInstructions: deliveryInstructions || undefined,
      estimatedDeliveryTime: restaurant.estimatedDeliveryTime || 30,
      orderNumber: `OD-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      notes: `serviceCharge=${SERVICE_CHARGE}`,
    });

    return NextResponse.json({ order, fees: { serviceCharge: SERVICE_CHARGE, deliveryFee: DELIVERY_FEE } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create order' }, { status: 400 });
  }
}
