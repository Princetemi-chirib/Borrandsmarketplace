import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get full restaurant settings
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: auth.restaurantId },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        university: true,
        cuisine: true,
        isOpen: true,
        acceptingOrders: true,
        deliveryFee: true,
        minimumOrder: true,
        estimatedDeliveryTime: true,
        image: true,
        bannerImage: true,
        features: true,
        paymentMethods: true,
        operatingHours: true,
        location: true,
        user: {
          select: {
            email: true,
            phone: true
          }
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }

    // Parse operating hours if it's a JSON string
    let operatingHoursObj = {};
    if (typeof restaurant.operatingHours === 'string') {
      try {
        operatingHoursObj = JSON.parse(restaurant.operatingHours);
      } catch (e) {
        console.error('Failed to parse operatingHours:', e);
      }
    } else if (typeof restaurant.operatingHours === 'object' && restaurant.operatingHours !== null) {
      operatingHoursObj = restaurant.operatingHours;
    }

    // Return settings in the format expected by frontend
    return NextResponse.json({
      success: true,
      settings: {
        _id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || restaurant.user?.phone || '',
        website: '', // Not in schema yet
        university: restaurant.university || '',
        cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine : 
                 (typeof restaurant.cuisine === 'string' ? [restaurant.cuisine] : []),
        isOpen: restaurant.isOpen,
        deliveryFee: restaurant.deliveryFee || 0,
        minimumOrder: restaurant.minimumOrder || 0,
        estimatedDeliveryTime: restaurant.estimatedDeliveryTime || 30,
        image: restaurant.image || '',
        bannerImage: restaurant.bannerImage || '',
        features: Array.isArray(restaurant.features) ? restaurant.features : [],
        paymentMethods: Array.isArray(restaurant.paymentMethods) ? restaurant.paymentMethods : ['cash'],
        operatingHours: operatingHoursObj,
        location: restaurant.location || { type: 'Point', coordinates: [0, 0] }
      }
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();

    // Build update data object (only include fields that are provided)
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.university !== undefined) updateData.university = body.university;
    if (body.cuisine !== undefined) updateData.cuisine = body.cuisine;
    if (body.isOpen !== undefined) updateData.isOpen = body.isOpen;
    if (body.acceptingOrders !== undefined) updateData.acceptingOrders = body.acceptingOrders;
    if (body.deliveryFee !== undefined) updateData.deliveryFee = body.deliveryFee;
    if (body.minimumOrder !== undefined) updateData.minimumOrder = body.minimumOrder;
    if (body.estimatedDeliveryTime !== undefined) updateData.estimatedDeliveryTime = body.estimatedDeliveryTime;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.paymentMethods !== undefined) updateData.paymentMethods = body.paymentMethods;
    
    // Handle operating hours - store as JSON string
    if (body.operatingHours !== undefined) {
      updateData.operatingHours = JSON.stringify(body.operatingHours);
    }

    // Update restaurant settings
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: auth.restaurantId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      restaurant: {
        id: updatedRestaurant.id,
        name: updatedRestaurant.name
      }
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Failed to update settings', error: error.message },
      { status: 500 }
    );
  }
}
