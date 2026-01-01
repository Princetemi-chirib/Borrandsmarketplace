import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { sendVerificationEmail } from '@/lib/services/email';

// POST /api/auth/restaurant-email-verify - Send Email OTP
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { email } = body;

    console.log('📧 OTP sending request received for email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    console.log('🔍 Looking for user with email:', email);
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        otpCode: true,
        otpExpiresAt: true,
        otpAttempts: true,
        lastOtpSentAt: true
      }
    });
    console.log('🔍 User lookup result:', user ? `Found user: ${user.id}` : 'User not found');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found with this email address. Please complete restaurant registration first.' },
        { status: 404 }
      );
    }

    // Check if user is a restaurant owner
    if (user.role !== 'RESTAURANT') {
      return NextResponse.json(
        { error: 'This endpoint is only for restaurant owners' },
        { status: 403 }
      );
    }

    // Rate limit OTP sends (60s)
    const now = Date.now();
    if (user.lastOtpSentAt && now - new Date(user.lastOtpSentAt).getTime() < 60 * 1000) {
      return NextResponse.json(
        { error: 'Please wait a minute before requesting another OTP' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('🔑 Generated OTP:', otp, 'expires at:', otpExpiresAt);

    // Update user with OTP FIRST (before sending email)
    console.log('💾 Saving OTP to database...');
    const savedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: otpExpiresAt,
        otpAttempts: 0,
        lastOtpSentAt: new Date()
      }
    });
    console.log('✅ OTP saved to user:', savedUser.id, 'OTP stored:', !!savedUser.otpCode);

    // Verify OTP was actually saved
    if (!savedUser.otpCode) {
      console.error('❌ OTP was not saved to database!');
      return NextResponse.json(
        { error: 'Failed to save OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Send OTP via Email AFTER saving to database
    try {
      console.log('📧 Sending OTP via email...');
      const emailResult = await sendVerificationEmail(email, user.name, otp);
      
      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error);
        // Still return success since OTP is saved, but include it for development
        return NextResponse.json({
          message: 'OTP generated successfully. Email delivery failed, please check your email address.',
          email: email,
          otp: otp // For development/testing only - remove in production
        });
      }
      
      return NextResponse.json({
        message: 'OTP sent successfully via email',
        email: email
      });
    } catch (emailError) {
      console.error('Email OTP sending failed:', emailError);
      
      // If email fails, still return success since OTP is saved
      return NextResponse.json({
        message: 'OTP generated successfully. Email delivery failed, please check your email address.',
        email: email,
        otp: otp // For development/testing only - remove in production
      });
    }

  } catch (error) {
    console.error('Error sending email OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/restaurant-email-verify - Verify Email OTP
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { email, otp } = body;

    console.log('🔍 Verification request received:', { email, otp });

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email address and OTP are required' },
        { status: 400 }
      );
    }

    // Find user
    console.log('🔍 Looking for user with email:', email);
    const user = await prisma.user.findFirst({
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
        isVerified: true
      }
    });
    console.log('🔍 User lookup result:', user ? `Found user: ${user.id}` : 'User not found');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is a restaurant owner
    if (user.role !== 'RESTAURANT') {
      return NextResponse.json(
        { error: 'This endpoint is only for restaurant owners' },
        { status: 403 }
      );
    }

    // Check if OTP exists and is not expired
    console.log('🔍 User OTP details:', {
      hasOtpCode: !!user.otpCode,
      otpCode: user.otpCode,
      hasOtpExpiresAt: !!user.otpExpiresAt,
      otpExpiresAt: user.otpExpiresAt,
      currentTime: new Date()
    });
    
    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json(
        { error: 'No OTP found or OTP expired' },
        { status: 400 }
      );
    }

    if (new Date() > user.otpExpiresAt) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Check OTP attempts
    if ((user.otpAttempts || 0) >= 3) {
      return NextResponse.json(
        { error: 'Too many OTP attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.otpCode !== otp) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: (user.otpAttempts || 0) + 1 }
      });
      
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid - mark email as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0
      }
    });

    return NextResponse.json({
      message: 'Email verified successfully',
      user: {
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
        isVerified: updatedUser.isVerified
      }
    });

  } catch (error) {
    console.error('Error verifying email OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
