import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect, prisma } from '@/lib/db-prisma';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { token, newPassword } = body as { token?: string; newPassword?: string };

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() }
      },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset link. Please request a new password reset.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in with your new password.'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
