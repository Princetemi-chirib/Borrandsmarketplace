import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

// Helper function to check if restaurant is currently open based on operating hours
function isRestaurantOpen(operatingHours: any, manualIsOpen: boolean): boolean {
  // If manually set to closed, respect that
  if (!manualIsOpen) return false;
  
  // If no operating hours defined, use the manual isOpen value
  if (!operatingHours) return manualIsOpen;
  
  // Parse operating hours if it's a string
  let hours = operatingHours;
  if (typeof operatingHours === 'string') {
    try {
      hours = JSON.parse(operatingHours);
    } catch {
      return manualIsOpen; // If can't parse, use manual value
    }
  }
  
  if (!hours || typeof hours !== 'object') return manualIsOpen;
  
  // Get current day and time
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Time in minutes from midnight
  
  // Get today's schedule
  const todaySchedule = hours[currentDay];
  if (!todaySchedule) return manualIsOpen;
  
  // Check if restaurant is set to open today
  if (todaySchedule.isOpen === false) return false;
  
  // Parse open and close times
  const openTime = todaySchedule.open;
  const closeTime = todaySchedule.close;
  
  if (!openTime || !closeTime) return manualIsOpen;
  
  // Convert time strings (e.g., "09:00") to minutes from midnight
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };
  
  const openMinutes = parseTime(openTime);
  const closeMinutes = parseTime(closeTime);
  
  // Check if current time is within operating hours
  if (closeMinutes > openMinutes) {
    // Normal case: open and close on same day
    return currentTime >= openMinutes && currentTime < closeMinutes;
  } else {
    // Overnight case: closes after midnight
    return currentTime >= openMinutes || currentTime < closeMinutes;
  }
}

// Helper to get today's hours for display
function getTodayHours(operatingHours: any): { open: string; close: string } | null {
  if (!operatingHours) return null;
  
  let hours = operatingHours;
  if (typeof operatingHours === 'string') {
    try {
      hours = JSON.parse(operatingHours);
    } catch {
      return null;
    }
  }
  
  if (!hours || typeof hours !== 'object') return null;
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[new Date().getDay()];
  const todaySchedule = hours[currentDay];
  
  if (!todaySchedule || todaySchedule.isOpen === false) return null;
  
  return {
    open: todaySchedule.open || '09:00',
    close: todaySchedule.close || '22:00'
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        role: true,
        university: true,
        restaurants_userfavorites: {
          select: { id: true }
        }
      }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const restaurantId = params.id;

    // Get restaurant - verify it's approved and active (match marketplace behavior, no university filter)
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        isApproved: true,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        logo: true,
        bannerImage: true,
        rating: true,
        reviewCount: true,
        cuisine: true,
        deliveryFee: true,
        minimumOrder: true,
        estimatedDeliveryTime: true,
        isOpen: true,
        operatingHours: true, // Include operating hours
        distance: true,
        address: true,
        phone: true,
        website: true,
        university: true
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Get menu items for this restaurant
    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurant.id,
        isPublished: true,
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        priceDescription: true,
        image: true,
        categoryId: true,
        isAvailable: true,
        isFeatured: true,
        rating: true,
        reviewCount: true,
        preparationTime: true,
        isVegetarian: true,
        isSpicy: true,
        allergens: true
      },
      orderBy: [
        { isFeatured: 'desc' },
        { orderCount: 'desc' },
        { rating: 'desc' }
      ]
    });

    // Get categories to map categoryId to category name
    const categories = await prisma.category.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true }
    });

    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

    // Map menu items to include category name
    const menuWithCategories = menuItems.map(item => {
      // Parse allergens if it's a JSON string
      let allergensArray: string[] = [];
      if (item.allergens) {
        if (typeof item.allergens === 'string') {
          try {
            const parsed = JSON.parse(item.allergens);
            allergensArray = Array.isArray(parsed) ? parsed : [];
          } catch {
            // If not JSON, treat as comma-separated string
            allergensArray = item.allergens.includes(',') 
              ? item.allergens.split(',').map(a => a.trim()).filter(a => a)
              : item.allergens.trim() ? [item.allergens.trim()] : [];
          }
        } else if (Array.isArray(item.allergens)) {
          allergensArray = item.allergens;
        }
      }

      return {
        _id: item.id,
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        priceDescription: item.priceDescription,
        image: item.image || '',
        category: categoryMap.get(item.categoryId || '') || 'Uncategorized',
        categoryId: item.categoryId,
        isAvailable: item.isAvailable,
        isVegetarian: item.isVegetarian || false,
        isSpicy: item.isSpicy || false,
        allergens: allergensArray,
        preparationTime: item.preparationTime || 0,
        rating: item.rating || 0,
        reviewCount: item.reviewCount || 0
      };
    });

    // Get favorites IDs
    const favoritesIds = user.restaurants_userfavorites.map(f => f.id);

    // Calculate actual open status based on operating hours
    const actuallyOpen = isRestaurantOpen(restaurant.operatingHours, restaurant.isOpen);
    const todayHours = getTodayHours(restaurant.operatingHours);

    // Add favorite status, menu, and calculated isOpen
    const restaurantWithFavorite = {
      ...restaurant,
      _id: restaurant.id,
      isOpen: actuallyOpen, // Override with calculated value
      todayHours: todayHours, // Include today's hours for display
      isFavorite: favoritesIds.includes(restaurant.id) || false,
      menu: menuWithCategories
    };

    return NextResponse.json({ restaurant: restaurantWithFavorite });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
