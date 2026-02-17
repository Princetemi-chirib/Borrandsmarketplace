import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { sendPasswordResetEmail } from '@/lib/services/email';

function getBaseUrl(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const host = request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: emailTrimmed },
      select: { id: true, name: true, email: true, passwordResetExpires: true }
    });

    // Always return same message to avoid email enumeration
    const successMessage = 'If an account exists with this email, you will receive a password reset link shortly.';

    if (!user) {
      return NextResponse.json({ success: true, message: successMessage });
    }

    // Rate limit: don't send another reset if one was sent in the last 2 minutes
    const now = Date.now();
    if (user.passwordResetExpires && now < new Date(user.passwordResetExpires).getTime() - 58 * 60 * 1000) {
      const lastSent = new Date(user.passwordResetExpires).getTime() - 60 * 60 * 1000;
      if (now - lastSent < 2 * 60 * 1000) {
        return NextResponse.json({ success: true, message: successMessage });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires
      }
    });

    const baseUrl = getBaseUrl(request);
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetLink);

    if (!emailResult.success) {
      console.error('Forgot password email failed:', emailResult.error);
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: successMessage });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
