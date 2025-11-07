import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Parse favorites
    let favoritesArray: string[] = [];
    if (user.favorites) {
      try {
        favoritesArray = typeof user.favorites === 'string' ? JSON.parse(user.favorites) : user.favorites;
      } catch {}
    }

    // Get user's favorite restaurants
    const favorites = await prisma.restaurant.findMany({
      where: { id: { in: favoritesArray } },
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
        address: true
      }
    });

    return NextResponse.json({ favorites: favorites.map(f => ({ ...f, _id: f.id })) });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { restaurantId } = await request.json();
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });
    
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Parse favorites
    let favoritesArray: string[] = [];
    if (user.favorites) {
      try {
        favoritesArray = typeof user.favorites === 'string' ? JSON.parse(user.favorites) : user.favorites;
      } catch {}
    }

    // Add to favorites if not already there
    if (!favoritesArray.includes(restaurantId)) {
      favoritesArray.push(restaurantId);
      await prisma.user.update({
        where: { id: user.id },
        data: { favorites: JSON.stringify(favoritesArray) }
      });
    }

    return NextResponse.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
