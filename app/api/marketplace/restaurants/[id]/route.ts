import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getTodayHours, isRestaurantOpen } from '@/lib/restaurant-hours';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: params.id, isApproved: true, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        logo: true,
        bannerImage: true,
        cuisine: true,
        rating: true,
        reviewCount: true,
        deliveryFee: true,
        minimumOrder: true,
        estimatedDeliveryTime: true,
        isOpen: true,
        operatingHours: true,
      },
    });
    if (!restaurant) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }

    const actuallyOpen = isRestaurantOpen(restaurant.operatingHours, restaurant.isOpen);

    return NextResponse.json({
      restaurant: {
        ...restaurant,
        _id: restaurant.id,
        isOpen: actuallyOpen,
        todayHours: getTodayHours(restaurant.operatingHours),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load restaurant' }, { status: 500 });
  }
}
