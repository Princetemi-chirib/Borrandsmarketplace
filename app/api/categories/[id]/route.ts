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
    const allowed = ['name', 'description', 'isActive', 'sortOrder'];
    for (const key of allowed) if (key in body) update[key] = body[key];
    
    const category = await prisma.category.updateMany({
      where: { id, restaurantId: auth.restaurantId },
      data: update
    });
    
    if (category.count === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    
    const updatedCategory = await prisma.category.findUnique({ where: { id } });
    return NextResponse.json({ category: updatedCategory });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to update category' }, { status: 400 });
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
    const res = await prisma.category.deleteMany({
      where: { id, restaurantId: auth.restaurantId }
    });
    if (res.count === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to delete category' }, { status: 400 });
  }
}

