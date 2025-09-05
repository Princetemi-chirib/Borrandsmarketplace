import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/lib/models/Restaurant';

// PUT /api/restaurants/toggle-status - Toggle restaurant open/closed status
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
    const { isOpen } = body;

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json(
        { error: 'isOpen must be a boolean value' },
        { status: 400 }
      );
    }

    // Find and update the restaurant
    const restaurant = await Restaurant.findOneAndUpdate(
      { userId },
      { isOpen },
      { new: true }
    );

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Restaurant ${isOpen ? 'opened' : 'closed'} successfully`,
      restaurant: restaurant.toObject()
    });
    
  } catch (error) {
    console.error('Error toggling restaurant status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle restaurant status' },
      { status: 500 }
    );
  }
}
