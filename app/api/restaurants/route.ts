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
      // Convert lowercase status to uppercase for database query (DB stores uppercase)
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { cuisine: { contains: search } },
        { address: { contains: search } }
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
    // Normalize cuisine to always be an array
    const transformedRestaurants = restaurants.map(restaurant => {
      let cuisineArray: string[] = [];
      if (typeof restaurant.cuisine === 'string') {
        try {
          // Try to parse as JSON first (in case it's a JSON string)
          const parsed = JSON.parse(restaurant.cuisine);
          cuisineArray = Array.isArray(parsed) ? parsed : [restaurant.cuisine];
        } catch {
          // If not JSON, treat as comma-separated string or single string
          cuisineArray = restaurant.cuisine.includes(',') 
            ? restaurant.cuisine.split(',').map(c => c.trim()).filter(c => c)
            : [restaurant.cuisine];
        }
      } else if (Array.isArray(restaurant.cuisine)) {
        cuisineArray = restaurant.cuisine;
      }

      return {
        ...restaurant,
        _id: restaurant.id,
        cuisine: cuisineArray,
        status: restaurant.status?.toLowerCase() || 'pending', // Normalize status to lowercase
        // Filter out the old non-existent default image path
        image: restaurant.image && restaurant.image !== '/images/default-restaurant.jpg' ? restaurant.image : '',
        logo: restaurant.logo || '',
        bannerImage: restaurant.bannerImage && restaurant.bannerImage !== '/images/default-restaurant.jpg' ? restaurant.bannerImage : (restaurant.bannerImage || ''),
        owner: restaurant.user ? {
          _id: restaurant.user.id,
          name: restaurant.user.name,
          phone: restaurant.user.phone
        } : null
      };
    });
    
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
      ownerEmail,
      ownerPhone,
      ownerPassword,
      university,
      coordinates,
      openingTime,
      closingTime
    } = body;
    
    // Validation
    if (!name || !description || !cuisine || !address || !phone || !ownerEmail || !ownerPhone || !ownerPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if restaurant with same name already exists
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: { 
        name: { 
          contains: name
        }
      }
    });
    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant with this name already exists' },
        { status: 400 }
      );
    }
    
    // Check if owner email already exists and is verified
    const existingUserByEmail = await prisma.user.findFirst({ where: { email: ownerEmail } });
    if (existingUserByEmail && existingUserByEmail.emailVerified) {
      return NextResponse.json(
        { error: 'User with this email address already exists and is verified' },
        { status: 400 }
      );
    }
    
    // Check if owner phone already exists and is verified
    const existingUserByPhone = await prisma.user.findFirst({ where: { phone: ownerPhone } });
    if (existingUserByPhone && existingUserByPhone.phoneVerified) {
      return NextResponse.json(
        { error: 'User with this phone number already exists and is verified' },
        { status: 400 }
      );
    }
    
    // If user exists but not verified, allow re-registration (update existing)
    // Prefer email match over phone match
    const existingUser = existingUserByEmail || existingUserByPhone;
    
    // If both exist but are different users, that's an error
    if (existingUserByEmail && existingUserByPhone && existingUserByEmail.id !== existingUserByPhone.id) {
      return NextResponse.json(
        { error: 'Email and phone number are associated with different accounts' },
        { status: 400 }
      );
    }
    
    if (existingUser && (!existingUser.emailVerified || !existingUser.phoneVerified)) {
      // Update existing unverified user
      const hashedPassword = await bcrypt.hash(ownerPassword, 12);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: ownerName,
          email: ownerEmail,
          phone: ownerPhone,
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
      
      // Build default operating hours from opening/closing time (same for all days)
      const openTime = openingTime || '08:00';
      const closeTime = closingTime || '22:00';
      const defaultOperatingHours = {
        monday: { open: openTime, close: closeTime, isOpen: true },
        tuesday: { open: openTime, close: closeTime, isOpen: true },
        wednesday: { open: openTime, close: closeTime, isOpen: true },
        thursday: { open: openTime, close: closeTime, isOpen: true },
        friday: { open: openTime, close: closeTime, isOpen: true },
        saturday: { open: openTime, close: closeTime, isOpen: true },
        sunday: { open: openTime, close: closeTime, isOpen: true },
      };

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
            operatingHours: JSON.stringify(defaultOperatingHours),
            features: JSON.stringify([]),
            paymentMethods: JSON.stringify([]),
            stats: JSON.stringify({})
          }
        });
        
        console.log('Restaurant saved successfully for existing user');

        return NextResponse.json({
          message: 'Restaurant application updated successfully. Pending admin approval.',
          restaurant: {
            _id: restaurant.id,
            name: restaurant.name,
            status: restaurant.status
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
      email: ownerEmail,
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
          email: ownerEmail,
          phone: ownerPhone,
          password: hashedPassword,
          role: 'RESTAURANT',
          university: university || '',
          isActive: true,
          isVerified: false,
          emailVerified: false,
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
      // Build default operating hours from opening/closing time (same for all days)
      const openTime = openingTime || '08:00';
      const closeTime = closingTime || '22:00';
      const defaultOperatingHours = {
        monday: { open: openTime, close: closeTime, isOpen: true },
        tuesday: { open: openTime, close: closeTime, isOpen: true },
        wednesday: { open: openTime, close: closeTime, isOpen: true },
        thursday: { open: openTime, close: closeTime, isOpen: true },
        friday: { open: openTime, close: closeTime, isOpen: true },
        saturday: { open: openTime, close: closeTime, isOpen: true },
        sunday: { open: openTime, close: closeTime, isOpen: true },
      };

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
          operatingHours: JSON.stringify(defaultOperatingHours),
          features: JSON.stringify([]),
          paymentMethods: JSON.stringify([]),
          stats: JSON.stringify({})
        }
      });
      console.log('Restaurant saved successfully');
    } catch (saveError) {
      console.error('Error saving restaurant:', saveError);
      throw saveError;
    }

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
