import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        otpCode: true,
        otpExpiresAt: true,
        otpAttempts: true,
        emailVerified: true,
        isVerified: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified && user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Email already verified. Please login.' },
        { status: 400 }
      );
    }

    // Check if OTP exists
    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json(
        { success: false, message: 'No OTP found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempts
    if (user.otpAttempts && user.otpAttempts >= 5) {
      return NextResponse.json(
        { success: false, message: 'Too many failed attempts. Please register again.' },
        { status: 429 }
      );
    }

    // Check if OTP expired
    if (new Date() > user.otpExpiresAt) {
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.otpCode !== code) {
      // Increment failed attempts
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: (user.otpAttempts || 0) + 1 }
      });

      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // OTP is correct - verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isVerified: true,
        isActive: true,
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      }
    });

    console.log(`✅ User ${email} verified successfully`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
