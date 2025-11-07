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
      select: { 
        id: true, 
        role: true,
        restaurants_userfavorites: {
          select: { id: true }
        }
      }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const cuisine = searchParams.get('cuisine') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const priceRange = searchParams.get('priceRange') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = { isOpen: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { cuisine: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (cuisine && cuisine !== 'all') {
      where.cuisine = { contains: cuisine };
    }

    if (priceRange && priceRange !== 'all') {
      switch (priceRange) {
        case 'low':
          where.deliveryFee = { lte: 300 };
          break;
        case 'medium':
          where.deliveryFee = { gt: 300, lte: 500 };
          break;
        case 'high':
          where.deliveryFee = { gt: 500 };
          break;
      }
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy.name = 'asc';
        break;
      case 'rating':
        orderBy.rating = 'desc';
        break;
      case 'distance':
        orderBy.distance = 'asc';
        break;
      case 'deliveryTime':
        orderBy.estimatedDeliveryTime = 'asc';
        break;
      case 'deliveryFee':
        orderBy.deliveryFee = 'asc';
        break;
      default:
        orderBy.name = 'asc';
    }

    // Get restaurants
    const restaurants = await prisma.restaurant.findMany({
      where,
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
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.restaurant.count({ where });

    // Parse favorites (if JSON string)
    // Get favorites IDs
    const favoritesIds = user.restaurants_userfavorites.map(f => f.id);

    // Add favorite status for each restaurant
    const restaurantsWithFavorites = restaurants.map(restaurant => ({
      ...restaurant,
      _id: restaurant.id,
      isFavorite: favoritesIds.includes(restaurant.id) || false
    }));

    return NextResponse.json({
      restaurants: restaurantsWithFavorites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
