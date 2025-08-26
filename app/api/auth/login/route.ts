import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { phone, password } = body;

    // Require phone/password for this endpoint; OTP login handled by /api/auth/verify-otp
    if (!phone || !password) {
      return NextResponse.json(
        { success: false, message: 'Phone and password are required. Or use OTP via /api/auth/verify-otp.' },
        { status: 400 }
      );
    }

    // Find user by phone and include password for comparison
    const user = await User.findOne({ phone }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated. Please contact support.' },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Password not set. Use OTP login.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone or password' },
        { status: 401 }
      );
    }

    // Optional: ensure phone verified
    if (!user.phoneVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your phone via OTP before logging in.', requiresVerification: true },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { user: userResponse, token }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}






