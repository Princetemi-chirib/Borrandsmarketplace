import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get popular delivery locations for student's university
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, university: true }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const minUseCount = parseInt(searchParams.get('minUseCount') || '5');

    // Get popular delivery locations for this university (used 5+ times)
    const locations = await prisma.deliveryLocation.findMany({
      where: {
        university: user.university,
        useCount: { gte: minUseCount },
        isActive: true
      },
      orderBy: {
        useCount: 'desc'
      },
      take: limit,
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        useCount: true
      }
    });

    return NextResponse.json({
      success: true,
      locations,
      university: user.university
    });
  } catch (error: any) {
    console.error('Error fetching delivery locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery locations' },
      { status: 500 }
    );
  }
}

// POST - Track/create delivery location
export async function POST(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, university: true }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, address, description } = body;

    if (!address || !name) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      );
    }

    // Check if location already exists for this university
    const existingLocation = await prisma.deliveryLocation.findUnique({
      where: {
        university_address: {
          university: user.university,
          address: address
        }
      }
    });

    if (existingLocation) {
      // Increment use count
      const updated = await prisma.deliveryLocation.update({
        where: { id: existingLocation.id },
        data: {
          useCount: { increment: 1 },
          // Update name/description if provided and different
          ...(name && name !== existingLocation.name ? { name } : {}),
          ...(description && description !== existingLocation.description ? { description } : {})
        }
      });

      return NextResponse.json({
        success: true,
        location: updated,
        message: 'Location use count incremented'
      });
    } else {
      // Create new location
      const newLocation = await prisma.deliveryLocation.create({
        data: {
          university: user.university,
          name,
          address,
          description: description || '',
          useCount: 1
        }
      });

      return NextResponse.json({
        success: true,
        location: newLocation,
        message: 'New delivery location created'
      });
    }
  } catch (error: any) {
    console.error('Error tracking delivery location:', error);
    return NextResponse.json(
      { error: 'Failed to track delivery location' },
      { status: 500 }
    );
  }
}

