import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const {
      name,
      email,
      phone,
      password,
      university,
      vehicleType,
      vehicleNumber,
      vehicleModel,
      vehicleColor,
      licenseNumber,
      insuranceNumber,
      currentAddress
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !password || !university || !vehicleType || !vehicleNumber) {
      return NextResponse.json(
        { success: false, message: 'Name, email, phone, password, university, vehicleType, and vehicleNumber are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and rider in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: 'RIDER',
          university,
          isVerified: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: false,
          whatsappVerified: false,
          addresses: JSON.stringify(currentAddress ? [currentAddress] : []),
          preferences: JSON.stringify({}),
          wallet: JSON.stringify({ balance: 0, transactions: [] }),
          stats: JSON.stringify({})
        }
      });

      // Create rider profile
      const rider = await tx.rider.create({
        data: {
          userId: user.id,
          name,
          email,
          phone,
          vehicleType: vehicleType.toUpperCase(),
          vehicleNumber,
          vehicleModel: vehicleModel || '',
          vehicleColor: vehicleColor || '',
          licenseNumber: licenseNumber || '',
          insuranceNumber: insuranceNumber || '',
          currentAddress: currentAddress || '',
          isOnline: false,
          isAvailable: true,
          isVerified: true,
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
            license: licenseNumber || '',
            insurance: insuranceNumber || ''
          }),
          stats: JSON.stringify({}),
          preferences: JSON.stringify({})
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      return { user, rider };
    });

    return NextResponse.json({
      success: true,
      message: 'Rider created successfully',
      rider: {
        _id: result.rider.id,
        id: result.rider.id,
        name: result.rider.name,
        email: result.rider.email,
        phone: result.rider.phone,
        vehicleType: result.rider.vehicleType,
        isOnline: result.rider.isOnline,
        isAvailable: result.rider.isAvailable,
        user: result.rider.user
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating rider:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Email or phone number already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create rider'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all active riders
    const riders = await prisma.rider.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform riders
    const transformedRiders = riders.map(rider => ({
      _id: rider.id,
      id: rider.id,
      name: rider.name,
      email: rider.email,
      phone: rider.phone,
      vehicleType: rider.vehicleType,
      isOnline: rider.isOnline,
      isAvailable: rider.isAvailable,
      rating: rider.rating,
      totalDeliveries: rider.totalDeliveries,
      user: rider.user
    }));

    return NextResponse.json({ 
      success: true, 
      riders: transformedRiders 
    });
  } catch (error: any) {
    console.error('Error fetching riders:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to fetch riders' 
    }, { status: 500 });
  }
}


