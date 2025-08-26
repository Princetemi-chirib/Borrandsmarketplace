import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import WhatsApp from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    let { name, phone, password, role, university, studentId, department, level } = body;

    // Normalize optional fields: treat empty strings as undefined
    if (studentId === '') studentId = undefined;
    if (department === '') department = undefined;
    if (level === '') level = undefined;
    if (password === '') password = undefined;

    // Validate required fields (phone is primary, password optional)
    if (!name || !phone || !role || !university) {
      return NextResponse.json(
        { success: false, message: 'Name, phone, role, and university are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this phone already exists' },
        { status: 400 }
      );
    }

    // Create new user (password optional, will be verified via OTP)
    const user = new User({
      name,
      phone,
      password, // Optional - can be set later
      role,
      university,
      studentId,
      department,
      level,
      isVerified: false, // Will be verified via OTP
      isActive: true,
      phoneVerified: false
    });

    await user.save();

    // Send welcome WhatsApp message
    try {
      const message = `Welcome to Borrands, ${name}! Your account has been created. Please verify your phone number to start using the platform.`;
      await WhatsApp.sendMessage(phone, message);
    } catch (error) {
      console.error('WhatsApp welcome message failed:', error);
      // Don't fail registration if WhatsApp fails
    }

    // Return success response (without password)
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
      message: 'Registration successful! Please verify your phone number via OTP.',
      data: userResponse
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'User with this phone already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}






