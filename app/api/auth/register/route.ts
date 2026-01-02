import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/services/email';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting registration process...');
    await dbConnect();
    console.log('Database connected successfully');

    const body = await request.json();
    console.log('Request body received:', { ...body, password: body.password ? '[HIDDEN]' : undefined });
    let { name, email, password, phone, role, university, studentId, department, level } = body;

    // Normalize optional fields: treat empty strings as undefined
    if (studentId === '') studentId = undefined;
    if (department === '') department = undefined;
    if (level === '') level = undefined;
    if (phone === '') phone = undefined;

    // Validate required fields
    if (!name || !email || !password || !role || !university) {
      return NextResponse.json(
        { success: false, message: 'Name, email, password, role, and university are required' },
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, isVerified: true, emailVerified: true }
    });

    if (existingUser) {
      // If user exists but is not verified, allow re-registration
      if (!existingUser.isVerified || !existingUser.emailVerified) {
        // Delete the unverified user to allow fresh registration
        await prisma.user.delete({ where: { id: existingUser.id } });
      } else {
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with OTP
    console.log('Creating user with data:', { name, email, role, university, studentId, department, level });
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role.toUpperCase(),
        university,
        studentId,
        department,
        level,
        isVerified: false,
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        whatsappVerified: false,
        otpCode: otp,
        otpExpiresAt: otpExpiresAt,
        otpAttempts: 0,
        addresses: JSON.stringify([]),
        preferences: JSON.stringify({}),
        wallet: JSON.stringify({ balance: 0, transactions: [] }),
        stats: JSON.stringify({})
      }
    });

    console.log('User created successfully with ID:', user.id);

    // Send verification email with OTP
    try {
      const emailResult = await sendVerificationEmail(email, name, otp);
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        // Still allow registration to succeed, but log the error
      } else {
        console.log('✅ Verification email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails - OTP is still saved in database
    }

    // Update lastOtpSentAt for rate limiting (after sending email)
    await prisma.user.update({
      where: { id: user.id },
      data: { lastOtpSentAt: new Date() }
    });

    // Return success response (without password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      university: user.university,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      data: userResponse,
      requiresVerification: true
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    if (error.code === 'P2002') {
      // Unique constraint violation
      return NextResponse.json(
        { success: false, message: 'User with this email already exists. Please try again.' },
        { status: 400 }
      );
    }

    // Provide more specific error messages based on the error type
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Invalid data provided. Please check your information.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}






