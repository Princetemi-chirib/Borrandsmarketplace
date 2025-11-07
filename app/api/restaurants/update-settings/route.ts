import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';

// PUT /api/restaurants/update-settings - Update restaurant settings
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Get user from token (you'll need to implement JWT verification)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      address,
      phone,
      website,
      university,
      cuisine,
      deliveryFee,
      minimumOrder,
      estimatedDeliveryTime,
      features,
      paymentMethods,
      operatingHours
    } = body;

    // Find the restaurant
    const existing = await prisma.restaurant.findFirst({ where: { userId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (university !== undefined) updateData.university = university;
    if (cuisine !== undefined) updateData.cuisine = cuisine;
    if (deliveryFee !== undefined) updateData.deliveryFee = deliveryFee;
    if (minimumOrder !== undefined) updateData.minimumOrder = minimumOrder;
    if (estimatedDeliveryTime !== undefined) updateData.estimatedDeliveryTime = estimatedDeliveryTime;
    if (features !== undefined) updateData.features = typeof features === 'string' ? features : JSON.stringify(features);
    if (paymentMethods !== undefined) updateData.paymentMethods = typeof paymentMethods === 'string' ? paymentMethods : JSON.stringify(paymentMethods);
    if (operatingHours !== undefined) updateData.operatingHours = typeof operatingHours === 'string' ? operatingHours : JSON.stringify(operatingHours);

    // Update the restaurant
    const restaurant = await prisma.restaurant.update({
      where: { id: existing.id },
      data: updateData
    });

    return NextResponse.json({
      message: 'Restaurant settings updated successfully',
      restaurant
    });
    
  } catch (error: any) {
    console.error('Error updating restaurant settings:', error);
    
    return NextResponse.json(
      { error: 'Failed to update restaurant settings' },
      { status: 500 }
    );
  }
}
