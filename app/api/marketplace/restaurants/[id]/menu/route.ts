import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: params.id, isApproved: true, isActive: true },
      select: { id: true }
    });
    if (!restaurant) return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });

    const items = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id, isPublished: true, isAvailable: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        priceDescription: true,
        image: true,
        categoryId: true,
        isFeatured: true,
        rating: true,
        reviewCount: true
      },
      orderBy: [
        { isFeatured: 'desc' },
        { orderCount: 'desc' },
        { rating: 'desc' }
      ]
    });

    return NextResponse.json({ items });
  } catch (e:any) {
    return NextResponse.json({ message: 'Failed to load menu' }, { status: 500 });
  }
}







