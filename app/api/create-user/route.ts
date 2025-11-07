import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, name, phone, role, university } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email || 'rabiutemi@gmail.com' } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password || 'Amanillah@12', 12);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name: name || 'Rabi Utemi',
        email: email || 'rabiutemi@gmail.com',
        password: hashedPassword,
        phone: phone || '+2348012345678',
        role: role?.toUpperCase() || 'STUDENT',
        university: university || 'University of Lagos',
        isVerified: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        whatsappVerified: false,
        addresses: JSON.stringify([]),
        preferences: JSON.stringify({}),
        wallet: JSON.stringify({ balance: 0, transactions: [] }),
        stats: JSON.stringify({})
      }
    });

    // Return user without password
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





