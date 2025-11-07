import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const restaurantId = auth.restaurantId;
    const items = await prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load menu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const restaurantId = auth.restaurantId;
    const body = await request.json();
    const { name, description, price, priceDescription, category, image, isAvailable, isPublished, packId, categoryId } = body;

    // Validate category/pack scoping
    if (categoryId) {
      const catOk = await prisma.category.findFirst({
        where: { id: categoryId, restaurantId },
        select: { id: true }
      });
      if (!catOk) return NextResponse.json({ message: 'Invalid categoryId' }, { status: 400 });
    }
    if (packId) {
      const packOk = await prisma.pack.findFirst({
        where: { id: packId, restaurantId },
        select: { id: true }
      });
      if (!packOk) return NextResponse.json({ message: 'Invalid packId' }, { status: 400 });
    }
    
    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        categoryId: categoryId || '',
        name,
        description,
        price,
        priceDescription,
        image,
        isAvailable: Boolean(isAvailable),
        isPublished: isPublished !== false,
        packId: packId || null,
        allergens: JSON.stringify([]),
        nutritionalInfo: JSON.stringify({}),
        ingredients: JSON.stringify([]),
        tags: JSON.stringify([])
      }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create item' }, { status: 400 });
  }
}

