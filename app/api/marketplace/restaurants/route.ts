import { NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';

export async function GET() {
  try {
    await dbConnect();
    const restaurants = await prisma.restaurant.findMany({
      where: {
        isApproved: true,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        cuisine: true,
        rating: true,
        reviewCount: true,
        image: true,
        bannerImage: true,
        estimatedDeliveryTime: true,
        deliveryFee: true,
        university: true
      },
      orderBy: { rating: 'desc' },
      take: 100
    });
    
    // Transform to include _id for backward compatibility
    const transformedRestaurants = restaurants.map(r => ({ ...r, _id: r.id }));
    
    return NextResponse.json({ restaurants: transformedRestaurants });
  } catch (e:any) {
    return NextResponse.json({ message: 'Failed to load restaurants' }, { status: 500 });
  }
}







