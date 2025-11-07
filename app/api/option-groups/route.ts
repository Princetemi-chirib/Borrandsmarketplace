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
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const query: any = { restaurantId };
    if (itemId) query.itemId = itemId;
    const groups = await prisma.optionGroup.findMany({
      where: query,
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ groups });
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed to load option groups' }, { status: 500 });
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
    const { itemId, name, minSelect, maxSelect, options } = body;
    const group = await prisma.optionGroup.create({
      data: {
        restaurantId,
        itemId,
        name,
        minSelect: Number(minSelect) || 0,
        maxSelect: Number(maxSelect) || 1,
        options: JSON.stringify(Array.isArray(options) ? options.map((o:any)=> ({ name: o.name, price: Number(o.price||0), itemId: o.itemId||undefined })) : [])
      }
    });
    return NextResponse.json({ group }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Failed to create option group' }, { status: 400 });
  }
}
