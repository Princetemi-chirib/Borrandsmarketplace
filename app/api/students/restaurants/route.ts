import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Helper function to check if restaurant is currently open based on operating hours
function isRestaurantOpen(operatingHours: any, manualIsOpen: boolean): boolean {
  // If manually set to closed, respect that
  if (!manualIsOpen) return false;
  
  // If no operating hours defined, use the manual isOpen value
  if (!operatingHours) return manualIsOpen;
  
  // Parse operating hours if it's a string
  let hours = operatingHours;
  if (typeof operatingHours === 'string') {
    try {
      hours = JSON.parse(operatingHours);
    } catch {
      return manualIsOpen; // If can't parse, use manual value
    }
  }
  
  if (!hours || typeof hours !== 'object') return manualIsOpen;
  
  // Get current day and time
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Time in minutes from midnight
  
  // Get today's schedule
  const todaySchedule = hours[currentDay];
  if (!todaySchedule) return manualIsOpen;
  
  // Check if restaurant is set to open today
  if (todaySchedule.isOpen === false) return false;
  
  // Parse open and close times
  const openTime = todaySchedule.open;
  const closeTime = todaySchedule.close;
  
  if (!openTime || !closeTime) return manualIsOpen;
  
  // Convert time strings (e.g., "09:00") to minutes from midnight
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };
  
  const openMinutes = parseTime(openTime);
  const closeMinutes = parseTime(closeTime);
  
  // Check if current time is within operating hours
  if (closeMinutes > openMinutes) {
    // Normal case: open and close on same day
    return currentTime >= openMinutes && currentTime < closeMinutes;
  } else {
    // Overnight case: closes after midnight
    return currentTime >= openMinutes || currentTime < closeMinutes;
  }
}

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
        university: true,
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

    // Build where clause - match marketplace behavior (no university filter)
    // Only show approved and active restaurants
    let where: any = { 
      isApproved: true,
      isActive: true
    };

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

    // Get restaurants - include operatingHours for open status calculation
    const restaurants = await prisma.restaurant.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        logo: true,
        bannerImage: true,
        rating: true,
        reviewCount: true,
        cuisine: true,
        deliveryFee: true,
        minimumOrder: true,
        estimatedDeliveryTime: true,
        isOpen: true,
        operatingHours: true, // Include operating hours for calculation
        distance: true,
        address: true
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.restaurant.count({ where });

    // Get favorites IDs
    const favoritesIds = user.restaurants_userfavorites.map(f => f.id);

    // Add favorite status and calculate real isOpen based on operating hours
    const restaurantsWithFavorites = restaurants.map(restaurant => {
      // Calculate actual open status based on operating hours
      const actuallyOpen = isRestaurantOpen(restaurant.operatingHours, restaurant.isOpen);
      
      return {
        ...restaurant,
        _id: restaurant.id,
        isOpen: actuallyOpen, // Override with calculated value
        isFavorite: favoritesIds.includes(restaurant.id) || false,
        featuredItems: []
      };
    });

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
