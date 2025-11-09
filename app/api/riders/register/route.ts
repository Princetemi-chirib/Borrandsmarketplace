import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      name,
      email,
      phone,
      password,
      university,
      currentAddress,
      vehicleType,
      vehicleNumber,
      vehicleModel,
      vehicleColor,
      licenseNumber,
      insuranceNumber
    } = body;
    
    // Validate required fields
    if (!name || !email || !phone || !password || !university || !currentAddress || !licenseNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user account
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'RIDER',
        university,
        isActive: true,
        isVerified: false,
        phoneVerified: false,
        emailVerified: false,
        whatsappVerified: false,
        addresses: JSON.stringify([currentAddress]),
        preferences: JSON.stringify({}),
        wallet: JSON.stringify({ balance: 0, transactions: [] }),
        stats: JSON.stringify({})
      }
    });
    
    // Create rider profile
    const rider = await prisma.rider.create({
      data: {
        userId: user.id,
        name,
        email,
        phone,
        vehicleType: vehicleType || 'MOTORCYCLE',
        vehicleNumber: vehicleNumber || '',
        vehicleModel: vehicleModel || '',
        vehicleColor: vehicleColor || '',
        licenseNumber,
        insuranceNumber: insuranceNumber || '',
        currentAddress,
        isOnline: false,
        isAvailable: true,
        isVerified: false,
        isActive: true,
        rating: 0,
        reviewCount: 0,
        totalDeliveries: 0,
        totalEarnings: 0,
        averageDeliveryTime: 30,
        completionRate: 100,
        currentLocation: JSON.stringify({ lat: 0, lng: 0 }),
        workingHours: JSON.stringify({}),
        documents: JSON.stringify({
          license: licenseNumber,
          insurance: insuranceNumber
        }),
        stats: JSON.stringify({}),
        preferences: JSON.stringify({})
      }
    });
    
    return NextResponse.json({
      message: 'Rider registration successful! Please login to continue.',
      rider: {
        id: rider.id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        isVerified: rider.isVerified
      },
      user: {
        id: user.id,
        role: user.role
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Rider registration error:', error);
    
    // Check for duplicate errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A rider with this information already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to register rider. Please try again.' },
      { status: 500 }
    );
  }
}

