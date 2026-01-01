import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

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
        rating: true,
        reviewCount: true,
        cuisine: true,
        deliveryFee: true,
        minimumOrder: true,
        estimatedDeliveryTime: true,
        isOpen: true,
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

    // Add favorite status and menu
    const restaurantWithFavorite = {
      ...restaurant,
      _id: restaurant.id,
      isFavorite: favoritesIds.includes(restaurant.id) || false,
      menu: menuWithCategories
    };

    return NextResponse.json({ restaurant: restaurantWithFavorite });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
