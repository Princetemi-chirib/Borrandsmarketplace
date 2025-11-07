import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

const ALLOWED_STATUSES = new Set(['PENDING','ACCEPTED','PREPARING','READY','PICKED_UP','DELIVERED','CANCELLED']);

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'all').toUpperCase();
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const query: any = { restaurantId: auth.restaurantId };
    if (status !== 'ALL' && ALLOWED_STATUSES.has(status)) {
      query.status = status;
    }

    const orders = await prisma.order.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

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

    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, isApproved: true, isActive: true },
      select: { id: true, estimatedDeliveryTime: true }
    });
    if (!restaurant) return NextResponse.json({ message: 'Restaurant not found or inactive' }, { status: 404 });

    // Load item prices from DB to prevent tampering
    const itemIds = items.map((it: any) => it.itemId);
    const dbItems = await prisma.menuItem.findMany({
      where: { id: { in: itemIds }, restaurantId: restaurant.id, isPublished: true },
      select: { id: true, name: true, price: true }
    });
    const idToItem = new Map(dbItems.map(it => [it.id, it]));

    const normalizedItems = items.map((it: any) => {
      const db = idToItem.get(it.itemId);
      if (!db) return null;
      const quantity = Math.max(1, Number(it.quantity || 1));
      const price = Number(db.price || 0);
      return {
        itemId: it.itemId,
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

    const order = await prisma.order.create({
      data: {
        studentId: auth.sub,
        restaurantId: restaurant.id,
        items: JSON.stringify(normalizedItems),
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod,
        deliveryAddress,
        deliveryInstructions: deliveryInstructions || undefined,
        estimatedDeliveryTime: restaurant.estimatedDeliveryTime || 30,
        orderNumber: `OD-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        notes: `serviceCharge=${SERVICE_CHARGE}`,
      }
    });

    return NextResponse.json({ order, fees: { serviceCharge: SERVICE_CHARGE, deliveryFee: DELIVERY_FEE } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create order' }, { status: 400 });
  }
}
