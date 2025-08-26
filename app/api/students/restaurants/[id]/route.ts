import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/lib/models/User';
import Restaurant from '@/lib/models/Restaurant';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const restaurantId = params.id;

    // Get restaurant with menu items
    const restaurant = await Restaurant.findById(restaurantId)
      .populate('menu')
      .select('name description image rating reviewCount cuisine deliveryFee minimumOrder estimatedDeliveryTime isOpen distance address phone email website menu');

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Add favorite status
    const restaurantWithFavorite = {
      ...restaurant.toObject(),
      isFavorite: user.favorites?.includes(restaurant._id) || false
    };

    return NextResponse.json({ restaurant: restaurantWithFavorite });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
