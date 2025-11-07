import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const restaurantId = auth.restaurantId;
    const packs = await prisma.pack.findMany({
      where: { restaurantId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });
    return NextResponse.json({ packs });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load packs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const restaurantId = auth.restaurantId;
    const body = await request.json();
    const { name, description, price, isActive } = body;
    const pack = await prisma.pack.create({
      data: { restaurantId, name, description, price, isActive: Boolean(isActive) }
    });
    return NextResponse.json({ pack }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create pack' }, { status: 400 });
  }
}
