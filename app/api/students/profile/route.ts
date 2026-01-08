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

    // Verify role is STUDENT
    if (user.role !== 'STUDENT') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    // Parse JSON fields
    const addresses = typeof user.addresses === 'string' ? JSON.parse(user.addresses) : user.addresses;
    const preferences = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
    const wallet = typeof user.wallet === 'string' ? JSON.parse(user.wallet) : user.wallet;
    const stats = typeof user.stats === 'string' ? JSON.parse(user.stats) : user.stats;

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        university: user.university,
        studentId: user.studentId,
        department: user.department,
        level: user.level,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        whatsappVerified: user.whatsappVerified,
        addresses: addresses || [],
        preferences: preferences || {},
        wallet: wallet || { balance: 0, transactions: [] },
        stats: stats || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();

    // Verify user exists and is a student
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();

    // Build update object (only include allowed fields)
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.level !== undefined) updateData.level = body.level;
    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage;
    
    // Handle addresses (JSON field)
    if (body.addresses !== undefined) {
      updateData.addresses = typeof body.addresses === 'string' 
        ? body.addresses 
        : JSON.stringify(body.addresses);
    }
    
    // Handle preferences (JSON field)
    if (body.preferences !== undefined) {
      updateData.preferences = typeof body.preferences === 'string'
        ? body.preferences
        : JSON.stringify(body.preferences);
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        university: true,
        studentId: true,
        department: true,
        level: true,
        profileImage: true,
        addresses: true,
        preferences: true
      }
    });

    // Parse JSON fields for response
    const addresses = typeof updatedUser.addresses === 'string' 
      ? JSON.parse(updatedUser.addresses) 
      : updatedUser.addresses;
    const preferences = typeof updatedUser.preferences === 'string'
      ? JSON.parse(updatedUser.preferences)
      : updatedUser.preferences;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        university: updatedUser.university,
        studentId: updatedUser.studentId,
        department: updatedUser.department,
        level: updatedUser.level,
        profileImage: updatedUser.profileImage,
        addresses: addresses || [],
        preferences: preferences || {}
      }
    });
  } catch (error: any) {
    console.error('Error updating student profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}





