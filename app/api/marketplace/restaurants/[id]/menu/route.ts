import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import Restaurant from '@/lib/models/Restaurant';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const restaurant = await Restaurant.findOne({ _id: params.id, isApproved: true, isActive: true }).select('_id').lean() as any;
    if (!restaurant) return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });

    const items = await MenuItem.find({ restaurantId: restaurant._id, isPublished: true, isAvailable: true })
      .select('name description price priceDescription image categoryId isFeatured rating reviewCount')
      .sort({ isFeatured: -1, orderCount: -1, rating: -1 })
      .lean();

    return NextResponse.json({ items });
  } catch (e:any) {
    return NextResponse.json({ message: 'Failed to load menu' }, { status: 500 });
  }
}







