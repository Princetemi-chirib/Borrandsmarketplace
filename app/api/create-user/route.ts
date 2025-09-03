import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, name, phone, role, university } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name: name || 'Rabi Utemi',
      email: email || 'rabiutemi@gmail.com',
      password: password || 'Amanillah@12',
      phone: phone || '+2348012345678',
      role: role || 'student',
      university: university || 'University of Lagos',
      isVerified: true,
      isActive: true
    });

    await user.save();

    // Return user without password
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

    return NextResponse.json(
      { 
        success: true, 
        message: 'User created successfully',
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create user',
        error: error.message 
      },
      { status: 500 }
    );
  }
}





