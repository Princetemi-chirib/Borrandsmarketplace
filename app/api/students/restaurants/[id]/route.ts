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
      select: { 
        id: true, 
        role: true,
        university: true,
        restaurants_userfavorites: {
          select: { id: true }
        }
      }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const restaurantId = params.id;

    // Get restaurant - verify it belongs to student's university
    const restaurant = await prisma.restaurant.findUnique({
      where: { 
        id: restaurantId
      },
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
        website: true,
        university: true
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Verify restaurant belongs to student's university
    if (restaurant.university !== user.university) {
      return NextResponse.json({ 
        error: 'This restaurant is not available at your university' 
      }, { status: 403 });
    }

    // Get favorites IDs
    const favoritesIds = user.restaurants_userfavorites.map(f => f.id);

    // Add favorite status
    const restaurantWithFavorite = {
      ...restaurant,
      _id: restaurant.id,
      isFavorite: favoritesIds.includes(restaurant.id) || false
    };

    return NextResponse.json({ restaurant: restaurantWithFavorite });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
