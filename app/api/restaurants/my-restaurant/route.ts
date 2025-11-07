import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/restaurants/my-restaurant - Get current user's restaurant
export async function GET(request: NextRequest) {
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
    // For now, we'll use a simple approach - in production, use proper JWT verification
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true }
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      restaurant: { ...restaurant, _id: restaurant.id }
    });
    
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}
