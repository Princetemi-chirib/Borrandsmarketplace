import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, otpCode } = body;

    if (!email || !otpCode) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        otpCode: true,
        otpExpiresAt: true,
        emailVerified: true,
        isVerified: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email already verified' },
        { status: 400 }
      );
    }

    // Check if OTP code matches
    if (user.otpCode !== otpCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'OTP code has expired' },
        { status: 400 }
      );
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Email verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
