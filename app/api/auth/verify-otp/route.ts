import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { phone, code } = body as { phone: string; code: string };

    if (!phone || !code) {
      return NextResponse.json({ success: false, message: 'Phone and code are required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ 
      where: { phone },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        university: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        otpCode: true,
        otpExpiresAt: true,
        otpAttempts: true,
        loginCount: true
      }
    });
    
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json({ success: false, message: 'Invalid or expired code' }, { status: 400 });
    }

    if (user.otpAttempts && user.otpAttempts >= 5) {
      return NextResponse.json({ success: false, message: 'Too many attempts. Please request a new code.' }, { status: 429 });
    }

    if (new Date(user.otpExpiresAt).getTime() < Date.now()) {
      return NextResponse.json({ success: false, message: 'Code expired. Request a new one.' }, { status: 400 });
    }

    if (user.otpCode !== code) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: (user.otpAttempts || 0) + 1 }
      });
      return NextResponse.json({ success: false, message: 'Invalid code' }, { status: 400 });
    }

    // Success: clear OTP fields, mark phone verified, update login stats
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
        phoneVerified: true,
        isVerified: true,
        lastLogin: new Date(),
        loginCount: (user.loginCount || 0) + 1
      }
    });

    const token = generateToken(updatedUser);

    const userResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      university: updatedUser.university,
      isVerified: updatedUser.isVerified,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    };

    return NextResponse.json({ success: true, message: 'OTP verified', data: { user: userResponse, token } });
  } catch (error: any) {
    console.error('verify-otp error:', error);
    return NextResponse.json({ success: false, message: 'Failed to verify OTP' }, { status: 500 });
  }
}
