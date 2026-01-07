import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

// PUT /api/restaurants/toggle-status - Toggle restaurant open/closed status
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isOpen } = body;

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json(
        { error: 'isOpen must be a boolean value' },
        { status: 400 }
      );
    }

    // Update the restaurant for the authenticated restaurantId
    const restaurant = await prisma.restaurant.update({
      where: { id: auth.restaurantId },
      data: { isOpen }
    });

    return NextResponse.json({
      message: `Restaurant ${isOpen ? 'opened' : 'closed'} successfully`,
      restaurant
    });
  } catch (error) {
    console.error('Error toggling restaurant status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle restaurant status' },
      { status: 500 }
    );
  }
}
