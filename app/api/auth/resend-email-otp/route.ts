import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { sendVerificationEmail } from '@/lib/services/email';
import { sendWhatsApp } from '@/lib/services/whatsapp';

// POST /api/auth/resend-email-otp - Resend Email OTP for Student Registration
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { email } = body;

    console.log('📧 Resend OTP request received for email:', email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
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
        phone: true,
        role: true,
        otpCode: true,
        otpExpiresAt: true,
        otpAttempts: true,
        lastOtpSentAt: true,
        emailVerified: true,
        isVerified: true
      }
    });
    console.log('🔍 User lookup result:', user ? `Found user: ${user.id}` : 'User not found');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found with this email address. Please register first.' },
        { status: 404 }
      );
    }

    // Only allow resend for unverified users
    if (user.emailVerified && user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Email already verified. Please login.' },
        { status: 400 }
      );
    }

    // Rate limit OTP sends (60s)
    const now = Date.now();
    if (user.lastOtpSentAt && now - new Date(user.lastOtpSentAt).getTime() < 60 * 1000) {
      return NextResponse.json(
        { success: false, error: 'Please wait a minute before requesting another OTP' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('🔑 Generated new OTP:', otp, 'expires at:', otpExpiresAt);

    // Update user with new OTP and reset attempts
    console.log('💾 Saving new OTP to database...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: otpExpiresAt,
        otpAttempts: 0,
        lastOtpSentAt: new Date()
      }
    });

    console.log('✅ OTP saved to database');

    // Send verification email with OTP
    try {
      const emailResult = await sendVerificationEmail(email, user.name, otp);
      if (!emailResult.success) {
        console.error('❌ Failed to send verification email:', emailResult.error);
        return NextResponse.json(
          { success: false, error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      } else {
        console.log('✅ Verification email sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    // Also send WhatsApp notification if phone number provided
    if (user.phone) {
      try {
        const whatsappMessage = `🎓 Welcome to Borrands, ${user.name}!\n\nYour email verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nEnter this code to activate your account and start ordering from your favorite campus restaurants!`;
        await sendWhatsApp(user.phone, whatsappMessage);
        console.log('✅ WhatsApp OTP sent successfully');
      } catch (whatsappError) {
        console.error('❌ Error sending WhatsApp OTP:', whatsappError);
        // Don't fail if WhatsApp fails - email is the primary method
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully! Check your email and WhatsApp for the verification code.'
    });

  } catch (error: any) {
    console.error('❌ Resend OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend OTP. Please try again.' },
      { status: 500 }
    );
  }
}

