import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const id = params.id;
    const body = await request.json();
    const update: Record<string, any> = {};
    const allowed = ['name', 'description', 'price', 'isActive', 'sortOrder'];
    for (const key of allowed) if (key in body) update[key] = body[key];
    const result = await prisma.pack.updateMany({
      where: { id, restaurantId: auth.restaurantId },
      data: update
    });
    if (result.count === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    const pack = await prisma.pack.findUnique({ where: { id } });
    return NextResponse.json({ pack });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to update pack' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'restaurant' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const id = params.id;
    const res = await prisma.pack.deleteMany({
      where: { id, restaurantId: auth.restaurantId }
    });
    if (res.count === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to delete pack' }, { status: 400 });
  }
}

