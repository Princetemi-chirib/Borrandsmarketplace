import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import bcrypt from 'bcryptjs';

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
    const existingUser = await prisma.user.findFirst({ 
      where: { phone: phone || undefined }
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this phone already exists' },
        { status: 400 }
      );
    }

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

    // Create new user
    console.log('Creating user with data:', { name, phone, role, university, studentId, department, level });
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword || '',
        email: `${phone}@temp.placeholder`,
        role: role.toUpperCase(),
        university,
        studentId,
        department,
        level,
        isVerified: false,
        isActive: true,
        phoneVerified: false,
        emailVerified: false,
        whatsappVerified: false,
        addresses: JSON.stringify([]),
        preferences: JSON.stringify({}),
        wallet: JSON.stringify({ balance: 0, transactions: [] }),
        stats: JSON.stringify({})
      }
    });

    console.log('User saved successfully with ID:', user.id);

    // Return success response
    const userResponse = {
      id: user.id,
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
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'User with this phone already exists. Please try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}


