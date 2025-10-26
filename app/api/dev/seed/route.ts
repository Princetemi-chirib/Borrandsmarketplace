import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Restaurant from '@/lib/models/Restaurant';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export async function POST() {
  try {
    await dbConnect();

    // Create student user
    const student = await User.create({
      name: 'Test Student',
      phone: '+2348000000011',
      role: 'student',
      university: 'Test University',
      isVerified: true,
      phoneVerified: true,
      isActive: true,
    });

    // Create restaurant user and restaurant
    const restUser = await User.create({
      name: 'Test Restaurant Owner',
      phone: '+2348000000022',
      role: 'restaurant',
      university: 'Test University',
      isVerified: true,
      phoneVerified: true,
      isActive: true,
    });

    const restaurant = await Restaurant.create({
      userId: restUser._id,
      name: 'Seed Bistro',
      description: 'Tasty test meals',
      address: 'Campus Road',
      phone: restUser.phone,
      university: 'Test University',
      cuisine: ['Local','Fast Food'],
      rating: 4.6,
      reviewCount: 10,
      isOpen: true,
      deliveryFee: 500,
      minimumOrder: 0,
      estimatedDeliveryTime: 30,
      image: '/placeholder.png',
      isApproved: true,
      isActive: true,
      phoneVerified: true,
      whatsappVerified: true,
      operatingHours: {
        monday: { open: '08:00', close: '22:00', isOpen: true },
        tuesday: { open: '08:00', close: '22:00', isOpen: true },
        wednesday: { open: '08:00', close: '22:00', isOpen: true },
        thursday: { open: '08:00', close: '22:00', isOpen: true },
        friday: { open: '08:00', close: '22:00', isOpen: true },
        saturday: { open: '08:00', close: '22:00', isOpen: true },
        sunday: { open: '08:00', close: '22:00', isOpen: true },
      },
      location: { type: 'Point', coordinates: [0,0] },
      features: [],
      paymentMethods: ['card'],
      categories: [],
      menu: [],
      stats: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, completionRate: 100 },
    } as any);

    // Issue quick tokens for testing
    const studentToken = jwt.sign({ sub: String(student._id), role: 'student' }, JWT_SECRET, { expiresIn: '7d' });
    const restaurantToken = jwt.sign({ sub: String(restUser._id), role: 'restaurant', restaurantId: String(restaurant._id) }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({
      ok: true,
      student: { id: String(student._id), phone: student.phone, token: studentToken },
      restaurant: { id: String(restUser._id), restaurantId: String(restaurant._id), token: restaurantToken },
    });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Seed failed' }, { status: 400 });
  }
}







