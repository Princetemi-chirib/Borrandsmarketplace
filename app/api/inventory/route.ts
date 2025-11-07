import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const items = await prisma.inventoryItem.findMany({
      where: { restaurantId: auth.restaurantId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const body = await request.json();
    const item = await prisma.inventoryItem.create({
      data: { ...body, restaurantId: auth.restaurantId }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create item' }, { status: 400 });
  }
}















