import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/lib/models/User';
import Restaurant from '@/lib/models/Restaurant';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
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

    // Build query
    let query: any = { isOpen: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (cuisine && cuisine !== 'all') {
      query.cuisine = cuisine;
    }

    if (priceRange && priceRange !== 'all') {
      switch (priceRange) {
        case 'low':
          query.deliveryFee = { $lte: 300 };
          break;
        case 'medium':
          query.deliveryFee = { $gt: 300, $lte: 500 };
          break;
        case 'high':
          query.deliveryFee = { $gt: 500 };
          break;
      }
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case 'name':
        sort.name = 1;
        break;
      case 'rating':
        sort.rating = -1;
        break;
      case 'distance':
        sort.distance = 1;
        break;
      case 'deliveryTime':
        sort.estimatedDeliveryTime = 1;
        break;
      case 'deliveryFee':
        sort.deliveryFee = 1;
        break;
      default:
        sort.name = 1;
    }

    // Get restaurants
    const restaurants = await Restaurant.find(query)
      .select('name description image rating reviewCount cuisine deliveryFee minimumOrder estimatedDeliveryTime isOpen distance address')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Restaurant.countDocuments(query);

    // Add favorite status for each restaurant
    const restaurantsWithFavorites = restaurants.map(restaurant => ({
      ...restaurant.toObject(),
      isFavorite: user.favorites?.includes(restaurant._id) || false
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
