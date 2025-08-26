import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { phone, code } = body as { phone: string; code: string };

    if (!phone || !code) {
      return NextResponse.json({ success: false, message: 'Phone and code are required' }, { status: 400 });
    }

    const user = await User.findOne({ phone }).select('+otpCode +otpExpiresAt +otpAttempts');
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
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return NextResponse.json({ success: false, message: 'Invalid code' }, { status: 400 });
    }

    // Success: clear OTP fields, mark phone verified, update login stats
    user.otpCode = undefined;
    user.otpExpiresAt = undefined as any;
    user.otpAttempts = 0;
    user.phoneVerified = true;
    user.isVerified = true;
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = generateToken(user);

    const userResponse = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      university: user.university,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return NextResponse.json({ success: true, message: 'OTP verified', data: { user: userResponse, token } });
  } catch (error: any) {
    console.error('verify-otp error:', error);
    return NextResponse.json({ success: false, message: 'Failed to verify OTP' }, { status: 500 });
  }
}
