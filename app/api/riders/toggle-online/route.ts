import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

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
      select: { id: true, isOnline: true, isAvailable: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    const { isOnline } = await request.json();

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json({ 
        error: 'isOnline must be a boolean value' 
      }, { status: 400 });
    }

    // Update rider online status
    const updatedRider = await prisma.rider.update({
      where: { id: rider.id },
      data: {
        isOnline,
        isAvailable: isOnline // When going offline, also set unavailable
      }
    });

    return NextResponse.json({
      success: true,
      message: isOnline ? 'You are now online and can receive orders' : 'You are now offline',
      rider: {
        id: updatedRider.id,
        isOnline: updatedRider.isOnline,
        isAvailable: updatedRider.isAvailable
      }
    });
  } catch (error: any) {
    console.error('Error toggling online status:', error);
    return NextResponse.json(
      { error: 'Failed to update online status' },
      { status: 500 }
    );
  }
}

