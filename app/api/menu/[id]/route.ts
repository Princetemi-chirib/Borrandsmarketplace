import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const id = params.id;
    const body = await request.json();
    const update: Record<string, any> = {};
    const allowed = ['name', 'description', 'price', 'priceDescription', 'image', 'isAvailable', 'isPublished', 'sortOrder', 'packId', 'categoryId'];
    for (const key of allowed) if (key in body) update[key] = body[key];

    if (update.categoryId) {
      const catOk = await prisma.category.findFirst({
        where: { id: update.categoryId, restaurantId: auth.restaurantId },
        select: { id: true }
      });
      if (!catOk) return NextResponse.json({ message: 'Invalid categoryId' }, { status: 400 });
    }
    if (update.packId) {
      const packOk = await prisma.pack.findFirst({
        where: { id: update.packId, restaurantId: auth.restaurantId },
        select: { id: true }
      });
      if (!packOk) return NextResponse.json({ message: 'Invalid packId' }, { status: 400 });
    }
    
    const result = await prisma.menuItem.updateMany({
      where: { id, restaurantId: auth.restaurantId },
      data: update
    });
    
    if (result.count === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    
    const item = await prisma.menuItem.findUnique({ where: { id } });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to update item' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const id = params.id;
    const res = await prisma.menuItem.deleteMany({
      where: { id, restaurantId: auth.restaurantId }
    });
    if (res.count === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to delete item' }, { status: 400 });
  }
}

