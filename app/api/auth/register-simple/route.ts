import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting simple registration process...');
    await dbConnect();
    console.log('Database connected successfully');

    const body = await request.json();
    console.log('Request body received:', { ...body, password: body.password ? '[HIDDEN]' : undefined });
    let { name, phone, password, role, university, studentId, department, level } = body;

    // Normalize optional fields: treat empty strings as undefined
    if (studentId === '') studentId = undefined;
    if (department === '') department = undefined;
    if (level === '') level = undefined;
    if (password === '') password = undefined;

    // Validate required fields
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

    // Create new user
    console.log('Creating user with data:', { name, phone, role, university, studentId, department, level });
    const user = new User({
      name,
      phone,
      password,
      role,
      university,
      studentId,
      department,
      level,
      isVerified: false,
      isActive: true,
      phoneVerified: false
    });

    console.log('User object created, attempting to save...');
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    // Return success response
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
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'User with this phone already exists. Please try again.' },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Invalid data provided. Please check your information.' },
        { status: 400 }
      );
    }

    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return NextResponse.json(
        { success: false, message: 'Database error. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}


