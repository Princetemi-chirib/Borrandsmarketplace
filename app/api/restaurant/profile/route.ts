import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const doc = await prisma.restaurant.findUnique({ where: { id: auth.restaurantId } });
    if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ profile: doc });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await request.json();
    const allowed = ['name','description','address','phone','website','university','cuisine','image','bannerImage'];
    const update: Record<string, any> = {};
    for (const key of allowed) if (key in body) update[key] = body[key];
    const doc = await prisma.restaurant.update({
      where: { id: auth.restaurantId },
      data: update
    });
    if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ profile: doc });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 400 });
  }
}















