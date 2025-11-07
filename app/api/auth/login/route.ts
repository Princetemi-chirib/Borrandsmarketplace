import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { generateToken, setAuthCookieOnResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;
    
    // Require email/password for this endpoint
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
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
        phone: true,
        password: true,
        role: true,
        university: true,
        isVerified: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
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
        { success: false, message: 'Password not set. Please contact support.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Ensure email verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email address before logging in.', requiresVerification: true },
        { status: 401 }
      );
    }

    // Create a user object compatible with generateToken (expects _id)
    const userForToken = {
      ...user,
      _id: user.id
    } as any;
    
    const token = generateToken(userForToken);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      university: user.university,
      isVerified: user.isVerified,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt
    };

    const res = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { user: userResponse }
    });
    setAuthCookieOnResponse(res, token);
    return res;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}






