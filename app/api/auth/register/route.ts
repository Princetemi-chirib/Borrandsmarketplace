import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import whatsappService from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, phone, password, role, university } = body;

    // Validate required fields
    if (!name || !email || !phone || !password || !role || !university) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password,
      role,
      university,
      isVerified: false, // Will be verified via email/phone
      isActive: true
    });

    await user.save();

    // Send welcome WhatsApp message
    try {
      await whatsappService.sendWelcomeMessage(phone, name, role);
    } catch (error) {
      console.error('WhatsApp welcome message failed:', error);
      // Don't fail registration if WhatsApp fails
    }

    // Return success response (without password)
    const userResponse = {
      _id: user._id,
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
      message: 'Registration successful! Please check your email for verification.',
      data: userResponse
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
