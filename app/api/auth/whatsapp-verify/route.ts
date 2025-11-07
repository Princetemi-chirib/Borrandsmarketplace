import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { sendWhatsAppOTP } from '@/lib/whatsapp';

// POST /api/auth/whatsapp-verify - Send WhatsApp OTP
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { phone } = body;

    console.log('📱 OTP sending request received for phone:', phone);

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    console.log('🔍 Looking for user with phone:', phone);
    const user = await prisma.user.findFirst({
      where: { phone },
      select: {
        id: true,
        phone: true,
        otpCode: true,
        otpExpiresAt: true,
        otpAttempts: true,
        lastOtpSentAt: true
      }
    });
    console.log('🔍 User lookup result:', user ? `Found user: ${user.id}` : 'User not found');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found with this phone number. Please complete restaurant registration first.' },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('🔑 Generated OTP:', otp, 'expires at:', otpExpiresAt);

    // Update user with OTP FIRST (before sending WhatsApp)
    console.log('🔧 Before saving - User OTP fields:', {
      otpCode: user.otpCode,
      otpExpiresAt: user.otpExpiresAt,
      otpAttempts: user.otpAttempts
    });
    
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
    
    // Double-check the saved user
    console.log('🔍 Verifying saved user OTP fields:', {
      otpCode: savedUser.otpCode,
      otpExpiresAt: savedUser.otpExpiresAt,
      otpAttempts: savedUser.otpAttempts
    });

    // Verify OTP was actually saved
    if (!savedUser.otpCode) {
      console.error('❌ OTP was not saved to database!');
      return NextResponse.json(
        { error: 'Failed to save OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Send OTP via WhatsApp AFTER saving to database
    try {
      console.log('📱 Sending OTP via WhatsApp...');
      await sendWhatsAppOTP(phone, otp);
      
      return NextResponse.json({
        message: 'OTP sent successfully via WhatsApp',
        phone: phone
      });
    } catch (whatsappError) {
      console.error('WhatsApp OTP sending failed:', whatsappError);
      
      // If WhatsApp fails, still return success since OTP is saved
      return NextResponse.json({
        message: 'OTP generated successfully. WhatsApp delivery failed, please check your phone number format.',
        phone: phone,
        otp: otp // For development/testing only - remove in production
      });
    }

  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/whatsapp-verify - Verify WhatsApp OTP
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { phone, otp } = body;

    console.log('🔍 Verification request received:', { phone, otp });

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Find user
    console.log('🔍 Looking for user with phone:', phone);
    const user = await prisma.user.findFirst({
      where: { phone },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        otpCode: true,
        otpExpiresAt: true,
        otpAttempts: true,
        phoneVerified: true,
        whatsappVerified: true,
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

    // OTP is valid - mark phone and WhatsApp as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        whatsappVerified: true,
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0
      }
    });

    return NextResponse.json({
      message: 'Phone and WhatsApp verified successfully',
      user: {
        _id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        phoneVerified: updatedUser.phoneVerified,
        whatsappVerified: updatedUser.whatsappVerified,
        isVerified: updatedUser.isVerified
      }
    });

  } catch (error) {
    console.error('Error verifying WhatsApp OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
