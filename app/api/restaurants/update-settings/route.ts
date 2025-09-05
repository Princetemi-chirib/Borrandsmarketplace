import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/lib/models/Restaurant';

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
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Update restaurant fields
    if (name !== undefined) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (address !== undefined) restaurant.address = address;
    if (phone !== undefined) restaurant.phone = phone;
    if (website !== undefined) restaurant.website = website;
    if (university !== undefined) restaurant.university = university;
    if (cuisine !== undefined) restaurant.cuisine = cuisine;
    if (deliveryFee !== undefined) restaurant.deliveryFee = deliveryFee;
    if (minimumOrder !== undefined) restaurant.minimumOrder = minimumOrder;
    if (estimatedDeliveryTime !== undefined) restaurant.estimatedDeliveryTime = estimatedDeliveryTime;
    if (features !== undefined) restaurant.features = features;
    if (paymentMethods !== undefined) restaurant.paymentMethods = paymentMethods;
    if (operatingHours !== undefined) restaurant.operatingHours = operatingHours;

    // Save the updated restaurant
    await restaurant.save();

    return NextResponse.json({
      message: 'Restaurant settings updated successfully',
      restaurant: restaurant.toObject()
    });
    
  } catch (error: any) {
    console.error('Error updating restaurant settings:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map((key: string) => 
        `${key}: ${error.errors[key].message}`
      ).join(', ');
      
      return NextResponse.json(
        { error: `Validation failed: ${validationErrors}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update restaurant settings' },
      { status: 500 }
    );
  }
}
