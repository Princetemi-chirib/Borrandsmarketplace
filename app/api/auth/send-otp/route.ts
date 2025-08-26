import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import WhatsApp from '@/lib/whatsapp';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { phone, purpose } = body as { phone: string; purpose?: 'login' | 'register' | 'verify' };

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone is required' }, { status: 400 });
    }

    // Find or create user for register flow
    let user = await User.findOne({ phone });

    if (!user && purpose === 'login') {
      return NextResponse.json({ success: false, message: 'No account found for this phone' }, { status: 404 });
    }

    if (!user) {
      user = await User.create({
        name: 'New User',
        phone,
        role: 'student',
        university: 'Unknown',
        isVerified: false,
        phoneVerified: false,
      });
    }

    // Rate limit OTP sends (60s)
    const now = Date.now();
    if (user.lastOtpSentAt && now - new Date(user.lastOtpSentAt).getTime() < 60 * 1000) {
      return NextResponse.json({ success: false, message: 'Please wait a minute before requesting another OTP' }, { status: 429 });
    }

    // Generate and save OTP
    const code = generateOtp();
    user.otpCode = code;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save();

    // Send via WhatsApp
    const message = `Your Borrands verification code is ${code}. It expires in 5 minutes.`;
    await WhatsApp.sendMessage(phone, message);

    return NextResponse.json({ success: true, message: 'OTP sent via WhatsApp' });
  } catch (error: any) {
    console.error('send-otp error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 });
  }
}
