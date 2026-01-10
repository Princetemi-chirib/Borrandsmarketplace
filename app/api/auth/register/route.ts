import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma, withRetry } from '@/lib/db-prisma';
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

    // Prepare OTP and password hashing (used in both update and create flows)
    const saltRounds = 12;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user already exists (with retry for transient errors)
    const existingUser = await withRetry(async () => {
      return await prisma.user.findUnique({ 
        where: { email },
        select: { id: true, isVerified: true, emailVerified: true }
      });
    });

    if (existingUser) {
      // If user exists and is verified, reject registration
      if (existingUser.isVerified && existingUser.emailVerified) {
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 400 }
        );
      }
      
      // If user exists but is not verified, update instead of delete+create
      // This avoids the prepared statement error with delete operations
      console.log('Found unverified user, updating instead of deleting:', existingUser.id);
      
      // Update the existing unverified user with new registration data
      // This is safer than delete+create and avoids prepared statement issues
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const user = await withRetry(async () => {
        return await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name,
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
            stats: JSON.stringify({}),
            updatedAt: new Date()
          }
        });
      });
      
      console.log('✅ Updated unverified user with new registration data:', user.id);
      
      // Send verification email and update lastOtpSentAt (same logic as new user)
      try {
        const emailResult = await sendVerificationEmail(email, name, otp);
        if (!emailResult.success) {
          console.error('Failed to send verification email:', emailResult.error);
        } else {
          console.log('✅ Verification email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
      
      await withRetry(async () => {
        return await prisma.user.update({
          where: { id: user.id },
          data: { lastOtpSentAt: new Date() }
        });
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
    }

    // Hash password for new user creation
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with OTP (with retry for transient errors)
    console.log('Creating user with data:', { name, email, role, university, studentId, department, level });
    const user = await withRetry(async () => {
      return await prisma.user.create({
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

    // Update lastOtpSentAt for rate limiting (after sending email, with retry)
    await withRetry(async () => {
      return await prisma.user.update({
        where: { id: user.id },
        data: { lastOtpSentAt: new Date() }
      });
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






