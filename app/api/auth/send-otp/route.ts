import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
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

    // Find existing user
    let user = await prisma.user.findFirst({ where: { phone } });

    if (!user && purpose === 'login') {
      return NextResponse.json({ success: false, message: 'No account found for this phone' }, { status: 404 });
    }

    // For registration, if user exists but is not verified, we can still send OTP
    // The registration route will handle cleaning up unverified users
    if (!user && purpose === 'register') {
      return NextResponse.json({ success: false, message: 'Please complete registration first' }, { status: 400 });
    }

    // Rate limit OTP sends (60s)
    const now = Date.now();
    if (user.lastOtpSentAt && now - new Date(user.lastOtpSentAt).getTime() < 60 * 1000) {
      return NextResponse.json({ success: false, message: 'Please wait a minute before requesting another OTP' }, { status: 429 });
    }

    // Generate and save OTP
    const code = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: code,
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        otpAttempts: 0,
        lastOtpSentAt: new Date()
      }
    });

    // Send via WhatsApp
    const message = `Your Borrands verification code is ${code}. It expires in 5 minutes.`;
    await WhatsApp.sendMessage(phone, message);

    return NextResponse.json({ success: true, message: 'OTP sent via WhatsApp' });
  } catch (error: any) {
    console.error('send-otp error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 });
  }
}
