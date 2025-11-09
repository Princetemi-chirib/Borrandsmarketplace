import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user and verify role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, university: true }
    });
    
    if (!user || user.role !== 'RIDER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get rider profile
    const rider = await prisma.rider.findUnique({
      where: { userId: user.id }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    // Parse JSON fields
    const documents = typeof rider.documents === 'string' ? JSON.parse(rider.documents) : rider.documents;
    const stats = typeof rider.stats === 'string' ? JSON.parse(rider.stats) : rider.stats;
    const preferences = typeof rider.preferences === 'string' ? JSON.parse(rider.preferences) : rider.preferences;

    return NextResponse.json({
      success: true,
      profile: {
        id: rider.id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        university: user.university,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
        vehicleModel: rider.vehicleModel,
        vehicleColor: rider.vehicleColor,
        licenseNumber: rider.licenseNumber,
        insuranceNumber: rider.insuranceNumber,
        profileImage: rider.profileImage,
        currentAddress: rider.currentAddress,
        isOnline: rider.isOnline,
        isAvailable: rider.isAvailable,
        isVerified: rider.isVerified,
        isActive: rider.isActive,
        rating: rider.rating,
        reviewCount: rider.reviewCount,
        totalDeliveries: rider.totalDeliveries,
        totalEarnings: rider.totalEarnings,
        averageDeliveryTime: rider.averageDeliveryTime,
        completionRate: rider.completionRate,
        documents,
        stats,
        preferences,
        createdAt: rider.createdAt,
        updatedAt: rider.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error fetching rider profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rider profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user and verify role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'RIDER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get rider profile
    const rider = await prisma.rider.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    const body = await request.json();

    // Build update object (only include provided fields)
    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.phone) updateData.phone = body.phone;
    if (body.currentAddress) updateData.currentAddress = body.currentAddress;
    if (body.vehicleType) updateData.vehicleType = body.vehicleType;
    if (body.vehicleNumber) updateData.vehicleNumber = body.vehicleNumber;
    if (body.vehicleModel !== undefined) updateData.vehicleModel = body.vehicleModel;
    if (body.vehicleColor !== undefined) updateData.vehicleColor = body.vehicleColor;
    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage;

    // Update rider profile
    const updatedRider = await prisma.rider.update({
      where: { id: rider.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedRider.id,
        name: updatedRider.name,
        phone: updatedRider.phone
      }
    });
  } catch (error: any) {
    console.error('Error updating rider profile:', error);
    return NextResponse.json(
      { error: 'Failed to update rider profile' },
      { status: 500 }
    );
  }
}

