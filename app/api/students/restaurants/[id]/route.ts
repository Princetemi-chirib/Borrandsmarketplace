import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, favorites: true }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const restaurantId = params.id;

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        rating: true,
        reviewCount: true,
        cuisine: true,
        deliveryFee: true,
        minimumOrder: true,
        estimatedDeliveryTime: true,
        isOpen: true,
        distance: true,
        address: true,
        phone: true,
        email: true,
        website: true
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Parse favorites (if JSON string)
    let favoritesArray: string[] = [];
    if (user.favorites) {
      try {
        favoritesArray = typeof user.favorites === 'string' ? JSON.parse(user.favorites) : user.favorites;
      } catch {}
    }

    // Add favorite status
    const restaurantWithFavorite = {
      ...restaurant,
      _id: restaurant.id,
      isFavorite: favoritesArray.includes(restaurant.id) || false
    };

    return NextResponse.json({ restaurant: restaurantWithFavorite });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
