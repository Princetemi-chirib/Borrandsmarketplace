import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/lib/models/Restaurant';
import User from '@/lib/models/User';
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
    
    // Build query
    let query: any = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    const restaurants = await Restaurant.find(query)
      .populate('userId', 'name phone') // Fixed: populate userId instead of owner
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Transform restaurants to include owner object for backward compatibility
    const transformedRestaurants = restaurants.map(restaurant => {
      const restaurantObj = restaurant.toObject();
      return {
        ...restaurantObj,
        owner: restaurantObj.userId ? {
          _id: restaurantObj.userId._id,
          name: restaurantObj.userId.name,
          phone: restaurantObj.userId.phone
        } : null
      };
    });
    
    const total = await Restaurant.countDocuments(query);
    
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
    const existingRestaurant = await Restaurant.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant with this name already exists' },
        { status: 400 }
      );
    }
    
    // Check if owner phone already exists and is verified
    const existingUser = await User.findOne({ phone: ownerPhone });
    if (existingUser && existingUser.phoneVerified) {
      return NextResponse.json(
        { error: 'User with this phone number already exists and is verified' },
        { status: 400 }
      );
    }
    
    // If user exists but not verified, allow re-registration (update existing)
    if (existingUser && !existingUser.phoneVerified) {
      // Update existing unverified user
      existingUser.name = ownerName;
      existingUser.password = await bcrypt.hash(ownerPassword, 12);
      existingUser.role = 'restaurant';
      existingUser.university = university;
      existingUser.status = 'active';
      existingUser.updatedAt = new Date();
      await existingUser.save();
      
      // Check if restaurant already exists for this user
      const existingRestaurant = await Restaurant.findOne({ userId: existingUser._id });
      if (existingRestaurant) {
        return NextResponse.json(
          { error: 'Restaurant application already submitted for this phone number' },
          { status: 400 }
        );
      }
      
      // Create restaurant for existing user
      const restaurant = new Restaurant({
        userId: existingUser._id, // Fixed: use userId instead of owner
        name,
        description,
        cuisine: [cuisine], // Fixed: wrap cuisine in array
        address,
        phone,
        website,
        deliveryFee: deliveryFee || 0,
        minimumOrder: minimumOrder || 0,
        estimatedDeliveryTime: estimatedDeliveryTime || 30,
        university,
        location: coordinates ? {
          type: 'Point',
          coordinates: coordinates
        } : {
          type: 'Point',
          coordinates: [0, 0] // Default coordinates if none provided
        },
        status: 'pending',
        isOpen: false,
        rating: 0,
        reviewCount: 0,
        menu: [],
        categories: []
      });
      
      console.log('Restaurant object created for existing user:', JSON.stringify(restaurant, null, 2));
      
      try {
        await restaurant.save();
        console.log('Restaurant saved successfully for existing user');
      } catch (saveError) {
        console.error('Error saving restaurant for existing user:', saveError);
        throw saveError;
      }
      
      // Update user with restaurant reference
      existingUser.restaurant = restaurant._id;
      await existingUser.save();
      
      return NextResponse.json({
        message: 'Restaurant application updated successfully. Pending admin approval.',
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          status: restaurant.status
        },
        owner: {
          _id: existingUser._id,
          name: existingUser.name,
          phone: existingUser.phone
        }
      }, { status: 201 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(ownerPassword, 12);
    
    console.log('Creating owner user with data:', {
      name: ownerName,
      phone: ownerPhone,
      role: 'restaurant',
      university,
      status: 'active'
    });
    
    // Create owner user
    const owner = new User({
      name: ownerName,
      phone: ownerPhone,
      password: hashedPassword,
      role: 'restaurant',
      university,
      status: 'active'
    });
    
    console.log('User object created:', JSON.stringify(owner, null, 2));
    
    try {
      await owner.save();
      console.log('Owner user saved successfully');
    } catch (saveError) {
      console.error('Error saving owner user:', saveError);
      throw saveError;
    }
    
    // Create restaurant
    const restaurant = new Restaurant({
      userId: owner._id, // Fixed: use userId instead of owner
      name,
      description,
      cuisine: [cuisine], // Fixed: wrap cuisine in array
      address,
      phone,
      website,
      deliveryFee: deliveryFee || 0,
      minimumOrder: minimumOrder || 0,
      estimatedDeliveryTime: estimatedDeliveryTime || 30,
      university,
      location: coordinates ? {
        type: 'Point',
        coordinates: coordinates
      } : {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates if none provided
      },
      status: 'pending',
      isOpen: false,
      rating: 0,
      reviewCount: 0,
      menu: [],
      categories: []
    });
    
    console.log('Restaurant object created:', JSON.stringify(restaurant, null, 2));
    
    try {
      await restaurant.save();
      console.log('Restaurant saved successfully');
    } catch (saveError) {
      console.error('Error saving restaurant:', saveError);
      throw saveError;
    }
    
    // Update owner with restaurant reference
    owner.restaurant = restaurant._id;
    await owner.save();
    
    return NextResponse.json({
      message: 'Restaurant created successfully. Pending admin approval.',
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        status: restaurant.status
      },
      owner: {
        _id: owner._id,
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
