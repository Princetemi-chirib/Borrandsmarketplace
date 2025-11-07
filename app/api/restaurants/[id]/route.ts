import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';

// GET /api/restaurants/[id] - Get restaurant by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    // Transform for backward compatibility
    const transformed = {
      ...restaurant,
      _id: restaurant.id,
      owner: restaurant.user ? {
        _id: restaurant.user.id,
        name: restaurant.user.name,
        email: restaurant.user.email,
        phone: restaurant.user.phone
      } : null
    };
    
    return NextResponse.json({ restaurant: transformed });
    
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}

// PUT /api/restaurants/[id] - Update restaurant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      name,
      description,
      cuisine,
      address,
      phone,
      email,
      website,
      deliveryFee,
      minimumOrder,
      estimatedDeliveryTime,
      isOpen,
      status
    } = body;
    
    const existing = await prisma.restaurant.findUnique({
      where: { id: params.id }
    });
    
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
    if (cuisine !== undefined) updateData.cuisine = cuisine;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (website !== undefined) updateData.website = website;
    if (deliveryFee !== undefined) updateData.deliveryFee = deliveryFee;
    if (minimumOrder !== undefined) updateData.minimumOrder = minimumOrder;
    if (estimatedDeliveryTime !== undefined) updateData.estimatedDeliveryTime = estimatedDeliveryTime;
    if (isOpen !== undefined) updateData.isOpen = isOpen;
    if (status !== undefined) updateData.status = status.toUpperCase();
    
    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: updateData
    });
    
    return NextResponse.json({
      message: 'Restaurant updated successfully',
      restaurant: { ...restaurant, _id: restaurant.id }
    });
    
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    );
  }
}

// DELETE /api/restaurants/[id] - Delete restaurant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    // Delete restaurant first (cascading delete should handle relations)
    await prisma.restaurant.delete({
      where: { id: params.id }
    });
    
    // Optionally delete owner user if they have no other restaurants
    if (restaurant.userId) {
      const otherRestaurants = await prisma.restaurant.count({
        where: { userId: restaurant.userId }
      });
      
      if (otherRestaurants === 0) {
        await prisma.user.delete({
          where: { id: restaurant.userId }
        });
      }
    }
    
    return NextResponse.json({
      message: 'Restaurant deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    );
  }
}
