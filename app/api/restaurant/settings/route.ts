import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get full restaurant settings
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: auth.restaurantId },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        university: true,
        cuisine: true,
        isOpen: true,
        deliveryFee: true,
        minimumOrder: true,
        estimatedDeliveryTime: true,
        image: true,
        logo: true,
        bannerImage: true,
        features: true,
        paymentMethods: true,
        operatingHours: true,
        location: true,
        user: {
          select: {
            email: true,
            phone: true
          }
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }

    // Parse operating hours if it's a JSON string
    let operatingHoursObj = {};
    if (typeof restaurant.operatingHours === 'string') {
      try {
        operatingHoursObj = JSON.parse(restaurant.operatingHours);
      } catch (e) {
        console.error('Failed to parse operatingHours:', e);
      }
    } else if (typeof restaurant.operatingHours === 'object' && restaurant.operatingHours !== null) {
      operatingHoursObj = restaurant.operatingHours;
    }

    // Return settings in the format expected by frontend
    return NextResponse.json({
      success: true,
      settings: {
        _id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || restaurant.user?.phone || '',
        website: '', // Not in schema yet
        university: restaurant.university || '',
        cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine : 
                 (typeof restaurant.cuisine === 'string' ? [restaurant.cuisine] : []),
        isOpen: restaurant.isOpen,
        deliveryFee: restaurant.deliveryFee || 0,
        minimumOrder: restaurant.minimumOrder || 0,
        estimatedDeliveryTime: restaurant.estimatedDeliveryTime || 30,
        image: restaurant.image || '',
        logo: restaurant.logo || '',
        bannerImage: restaurant.bannerImage || '',
        features: (() => {
          if (Array.isArray(restaurant.features)) return restaurant.features;
          if (typeof restaurant.features === 'string') {
            try {
              const parsed = JSON.parse(restaurant.features || '[]');
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        })(),
        paymentMethods: (() => {
          if (Array.isArray(restaurant.paymentMethods)) return restaurant.paymentMethods;
          if (typeof restaurant.paymentMethods === 'string') {
            try {
              const parsed = JSON.parse(restaurant.paymentMethods || '["cash"]');
              return Array.isArray(parsed) ? parsed : ['cash'];
            } catch {
              return ['cash'];
            }
          }
          return ['cash'];
        })(),
        operatingHours: operatingHoursObj,
        location: restaurant.location || { type: 'Point', coordinates: [0, 0] }
      }
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();

    // Build update data object (only include fields that are provided)
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.university !== undefined) updateData.university = body.university;
    if (body.cuisine !== undefined) {
      // Handle cuisine as array - convert to JSON string if needed
      if (Array.isArray(body.cuisine)) {
        updateData.cuisine = JSON.stringify(body.cuisine);
      } else if (typeof body.cuisine === 'string') {
        updateData.cuisine = body.cuisine;
      }
    }
    if (body.isOpen !== undefined) updateData.isOpen = body.isOpen;
    if (body.deliveryFee !== undefined) updateData.deliveryFee = body.deliveryFee;
    if (body.minimumOrder !== undefined) updateData.minimumOrder = body.minimumOrder;
    if (body.estimatedDeliveryTime !== undefined) updateData.estimatedDeliveryTime = body.estimatedDeliveryTime;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage;
    
    // Handle features - convert array to JSON string if needed
    if (body.features !== undefined) {
      if (Array.isArray(body.features)) {
        updateData.features = JSON.stringify(body.features);
      } else if (typeof body.features === 'string') {
        updateData.features = body.features;
      }
    }
    
    // Handle paymentMethods - convert array to JSON string if needed
    if (body.paymentMethods !== undefined) {
      if (Array.isArray(body.paymentMethods)) {
        updateData.paymentMethods = JSON.stringify(body.paymentMethods);
      } else if (typeof body.paymentMethods === 'string') {
        updateData.paymentMethods = body.paymentMethods;
      }
    }
    
    // Handle operating hours - store as JSON string
    if (body.operatingHours !== undefined) {
      updateData.operatingHours = JSON.stringify(body.operatingHours);
    }

    // Handle empty logo string - convert to null if empty
    if (updateData.logo === '') {
      updateData.logo = null;
    }
    
    console.log('Updating restaurant settings:', { 
      restaurantId: auth.restaurantId, 
      updateData: { ...updateData, logo: updateData.logo ? 'logo set' : 'no logo' } 
    });
    
    // Update restaurant settings
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: auth.restaurantId },
      data: updateData
    });

    // Return updated settings in the same format as GET
    let operatingHoursObj = {};
    if (typeof updatedRestaurant.operatingHours === 'string') {
      try {
        operatingHoursObj = JSON.parse(updatedRestaurant.operatingHours);
      } catch (e) {
        console.error('Failed to parse operatingHours:', e);
      }
    } else if (typeof updatedRestaurant.operatingHours === 'object' && updatedRestaurant.operatingHours !== null) {
      operatingHoursObj = updatedRestaurant.operatingHours;
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        _id: updatedRestaurant.id,
        name: updatedRestaurant.name,
        description: updatedRestaurant.description || '',
        address: updatedRestaurant.address || '',
        phone: updatedRestaurant.phone || '',
        website: '',
        university: updatedRestaurant.university || '',
        cuisine: Array.isArray(updatedRestaurant.cuisine) ? updatedRestaurant.cuisine : 
                 (typeof updatedRestaurant.cuisine === 'string' ? JSON.parse(updatedRestaurant.cuisine || '[]') : []),
        isOpen: updatedRestaurant.isOpen,
        deliveryFee: updatedRestaurant.deliveryFee || 0,
        minimumOrder: updatedRestaurant.minimumOrder || 0,
        estimatedDeliveryTime: updatedRestaurant.estimatedDeliveryTime || 30,
        image: updatedRestaurant.image || '',
        logo: updatedRestaurant.logo || '',
        bannerImage: updatedRestaurant.bannerImage || '',
        features: (() => {
          if (Array.isArray(updatedRestaurant.features)) return updatedRestaurant.features;
          if (typeof updatedRestaurant.features === 'string') {
            try {
              const parsed = JSON.parse(updatedRestaurant.features || '[]');
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        })(),
        paymentMethods: (() => {
          if (Array.isArray(updatedRestaurant.paymentMethods)) return updatedRestaurant.paymentMethods;
          if (typeof updatedRestaurant.paymentMethods === 'string') {
            try {
              const parsed = JSON.parse(updatedRestaurant.paymentMethods || '["cash"]');
              return Array.isArray(parsed) ? parsed : ['cash'];
            } catch {
              return ['cash'];
            }
          }
          return ['cash'];
        })(),
        operatingHours: operatingHoursObj,
        location: updatedRestaurant.location || { type: 'Point', coordinates: [0, 0] }
      }
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Failed to update settings', error: error.message },
      { status: 500 }
    );
  }
}
