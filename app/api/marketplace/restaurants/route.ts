import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/lib/models/Restaurant';

export async function GET() {
  try {
    await dbConnect();
    const restaurants = await Restaurant.find({ isApproved: true, isActive: true })
      .select('name cuisine rating reviewCount image bannerImage estimatedDeliveryTime deliveryFee university')
      .sort({ rating: -1 })
      .limit(100)
      .lean();
    return NextResponse.json({ restaurants });
  } catch (e:any) {
    return NextResponse.json({ message: 'Failed to load restaurants' }, { status: 500 });
  }
}







