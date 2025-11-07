import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import bcrypt from 'bcryptjs';

// GET /api/restaurants - Get all restaurants (for admin)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    let where: any = {};
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cuisine: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    
    // Transform restaurants to include owner object for backward compatibility
    const transformedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      _id: restaurant.id,
      owner: restaurant.user ? {
        _id: restaurant.user.id,
        name: restaurant.user.name,
        phone: restaurant.user.phone
      } : null
    }));
    
    const total = await prisma.restaurant.count({ where });
    
    return NextResponse.json({
      restaurants: transformedRestaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

// POST /api/restaurants - Create new restaurant
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      name,
      description,
      cuisine,
      address,
      phone,
      website,
      deliveryFee,
      minimumOrder,
      estimatedDeliveryTime,
      ownerName,
      ownerPhone,
      ownerPassword,
      university,
      coordinates
    } = body;
    
    // Validation
    if (!name || !description || !cuisine || !address || !phone || !ownerPhone || !ownerPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if restaurant with same name already exists
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: { 
        name: { 
          contains: name,
          mode: 'insensitive'
        }
      }
    });
    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant with this name already exists' },
        { status: 400 }
      );
    }
    
    // Check if owner phone already exists and is verified
    const existingUser = await prisma.user.findFirst({ where: { phone: ownerPhone } });
    if (existingUser && existingUser.phoneVerified) {
      return NextResponse.json(
        { error: 'User with this phone number already exists and is verified' },
        { status: 400 }
      );
    }
    
    // If user exists but not verified, allow re-registration (update existing)
    if (existingUser && !existingUser.phoneVerified) {
      // Update existing unverified user
      const hashedPassword = await bcrypt.hash(ownerPassword, 12);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: ownerName,
          password: hashedPassword,
          role: 'RESTAURANT',
          university: university,
          isActive: true,
          updatedAt: new Date()
        }
      });
      
      // Check if restaurant already exists for this user
      const existingRestaurantForUser = await prisma.restaurant.findFirst({
        where: { userId: updatedUser.id }
      });
      if (existingRestaurantForUser) {
        return NextResponse.json(
          { error: 'Restaurant application already submitted for this phone number' },
          { status: 400 }
        );
      }
      
      // Create restaurant for existing user
      console.log('Creating restaurant for existing user:', updatedUser.id);
      
      try {
        const restaurant = await prisma.restaurant.create({
          data: {
            userId: updatedUser.id,
            name,
            description,
            cuisine: cuisine,
            address,
            phone,
            website: website || '',
            deliveryFee: deliveryFee || 0,
            minimumOrder: minimumOrder || 0,
            estimatedDeliveryTime: estimatedDeliveryTime || 30,
            university: university || '',
            location: coordinates ? JSON.stringify({ type: 'Point', coordinates }) : JSON.stringify({ type: 'Point', coordinates: [0, 0] }),
            status: 'PENDING',
            isOpen: false,
            rating: 0,
            reviewCount: 0,
            categories: JSON.stringify([])
          }
        });
        
        console.log('Restaurant saved successfully for existing user');
        
        // Update user with restaurant reference
        const createdRestaurant = await prisma.restaurant.findUnique({
          where: { id: restaurant.id }
        });
        
        // Update user with restaurant reference
        await prisma.user.update({
          where: { id: updatedUser.id },
          data: { restaurantId: restaurant.id }
        });
        
        return NextResponse.json({
          message: 'Restaurant application updated successfully. Pending admin approval.',
          restaurant: {
            _id: createdRestaurant?.id,
            name: createdRestaurant?.name,
            status: createdRestaurant?.status
          },
          owner: {
            _id: updatedUser.id,
            name: updatedUser.name,
            phone: updatedUser.phone
          }
        }, { status: 201 });
      } catch (saveError) {
        console.error('Error saving restaurant for existing user:', saveError);
        throw saveError;
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(ownerPassword, 12);
    
    console.log('Creating owner user with data:', {
      name: ownerName,
      phone: ownerPhone,
      role: 'restaurant',
      university,
      isActive: true
    });
    
    // Create owner user
    let owner;
    try {
      owner = await prisma.user.create({
        data: {
          name: ownerName,
          phone: ownerPhone,
          password: hashedPassword,
          role: 'RESTAURANT',
          university: university || '',
          isActive: true,
          isVerified: false,
          phoneVerified: false,
          addresses: JSON.stringify([]),
          preferences: JSON.stringify({}),
          wallet: JSON.stringify({ balance: 0, transactions: [] }),
          stats: JSON.stringify({ totalOrders: 0, totalSpent: 0 })
        }
      });
      console.log('Owner user saved successfully');
    } catch (saveError) {
      console.error('Error saving owner user:', saveError);
      throw saveError;
    }
    
    // Create restaurant
    let restaurant;
    try {
      restaurant = await prisma.restaurant.create({
        data: {
          userId: owner.id,
          name,
          description,
          cuisine: cuisine,
          address,
          phone,
          website: website || '',
          deliveryFee: deliveryFee || 0,
          minimumOrder: minimumOrder || 0,
          estimatedDeliveryTime: estimatedDeliveryTime || 30,
          university: university || '',
          location: coordinates ? JSON.stringify({ type: 'Point', coordinates }) : JSON.stringify({ type: 'Point', coordinates: [0, 0] }),
          status: 'PENDING',
          isOpen: false,
          rating: 0,
          reviewCount: 0,
          categories: JSON.stringify([])
        }
      });
      console.log('Restaurant saved successfully');
    } catch (saveError) {
      console.error('Error saving restaurant:', saveError);
      throw saveError;
    }
    
    // Update owner with restaurant reference
    await prisma.user.update({
      where: { id: owner.id },
      data: { restaurantId: restaurant.id }
    });
    
    return NextResponse.json({
      message: 'Restaurant created successfully. Pending admin approval.',
      restaurant: {
        _id: restaurant.id,
        name: restaurant.name,
        status: restaurant.status
      },
      owner: {
        _id: owner.id,
        name: owner.name,
        phone: owner.phone
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map((key: string) => 
        `${key}: ${error.errors[key].message}`
      ).join(', ');
      
      return NextResponse.json(
        { error: `Validation failed: ${validationErrors}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}
