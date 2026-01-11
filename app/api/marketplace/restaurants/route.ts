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
        logo: true,
        bannerImage: true,
        estimatedDeliveryTime: true,
        deliveryFee: true,
        university: true
      },
      orderBy: { rating: 'desc' },
      take: 100
    });
    
    // Transform to include _id for backward compatibility and normalize cuisine to array
    const transformedRestaurants = restaurants.map(r => {
      let cuisineArray: string[] = [];
      if (typeof r.cuisine === 'string') {
        try {
          // Try to parse as JSON first (in case it's a JSON string)
          const parsed = JSON.parse(r.cuisine);
          cuisineArray = Array.isArray(parsed) ? parsed : [r.cuisine];
        } catch {
          // If not JSON, treat as comma-separated string or single string
          cuisineArray = r.cuisine.includes(',') 
            ? r.cuisine.split(',').map(c => c.trim()).filter(c => c)
            : [r.cuisine];
        }
      } else if (Array.isArray(r.cuisine)) {
        cuisineArray = r.cuisine;
      }

      return {
        ...r,
        _id: r.id,
        cuisine: cuisineArray,
        // Filter out the old non-existent default image path
        image: r.image && r.image !== '/images/default-restaurant.jpg' ? r.image : '',
        logo: r.logo || '',
        bannerImage: r.bannerImage && r.bannerImage !== '/images/default-restaurant.jpg' ? r.bannerImage : (r.bannerImage || '')
      };
    });
    
    return NextResponse.json({ restaurants: transformedRestaurants });
  } catch (e:any) {
    return NextResponse.json({ message: 'Failed to load restaurants' }, { status: 500 });
  }
}







