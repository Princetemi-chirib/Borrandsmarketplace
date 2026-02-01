import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Get recent users
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        university: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLogin: true
      }
    });

    // Transform users
    const transformedUsers = users.map(user => ({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.toLowerCase(),
      status: user.isActive ? 'active' : 'inactive',
      university: user.university,
      createdAt: user.createdAt.toISOString(),
      lastActive: user.lastLogin?.toISOString() || user.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      users: transformedUsers
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch users'
    }, { status: 500 });
  }
}




