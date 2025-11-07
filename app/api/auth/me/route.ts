import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        university: true,
        studentId: true,
        department: true,
        level: true,
        profileImage: true,
        isVerified: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        whatsappVerified: true,
        addresses: true,
        preferences: true,
        wallet: true,
        stats: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch user' }, { status: 500 });
  }
}


