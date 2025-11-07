import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function DELETE(
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
      select: { id: true, role: true, favorites: true }
    });
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const restaurantId = params.id;

    // Parse favorites
    let favoritesArray: string[] = [];
    if (user.favorites) {
      try {
        favoritesArray = typeof user.favorites === 'string' ? JSON.parse(user.favorites) : user.favorites;
      } catch {}
    }

    // Remove from favorites
    favoritesArray = favoritesArray.filter(id => id !== restaurantId);
    await prisma.user.update({
      where: { id: user.id },
      data: { favorites: JSON.stringify(favoritesArray) }
    });

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
