import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/lib/models/Restaurant';
import User from '@/lib/models/User';

// GET /api/restaurants/[id] - Get restaurant by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const restaurant = await Restaurant.findById(params.id)
      .populate('owner', 'name email phone')
      .populate('menu')
      .populate('categories');
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ restaurant });
    
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
    
    const restaurant = await Restaurant.findById(params.id);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (name) restaurant.name = name;
    if (description) restaurant.description = description;
    if (cuisine) restaurant.cuisine = cuisine;
    if (address) restaurant.address = address;
    if (phone) restaurant.phone = phone;
    if (email) restaurant.email = email;
    if (website) restaurant.website = website;
    if (deliveryFee !== undefined) restaurant.deliveryFee = deliveryFee;
    if (minimumOrder !== undefined) restaurant.minimumOrder = minimumOrder;
    if (estimatedDeliveryTime !== undefined) restaurant.estimatedDeliveryTime = estimatedDeliveryTime;
    if (isOpen !== undefined) restaurant.isOpen = isOpen;
    if (status) restaurant.status = status;
    
    await restaurant.save();
    
    return NextResponse.json({
      message: 'Restaurant updated successfully',
      restaurant
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
    
    const restaurant = await Restaurant.findById(params.id);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    // Delete owner user
    if (restaurant.owner) {
      await User.findByIdAndDelete(restaurant.owner);
    }
    
    // Delete restaurant
    await Restaurant.findByIdAndDelete(params.id);
    
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
