import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/riders/[id]
 * Admin only. Soft-deletes a rider: sets rider and linked user to inactive
 * so they disappear from the list and cannot log in.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const riderId = params.id;
    if (!riderId) {
      return NextResponse.json(
        { success: false, message: 'Rider ID is required' },
        { status: 400 }
      );
    }

    const rider = await prisma.rider.findUnique({
      where: { id: riderId },
      include: { user: { select: { id: true } } }
    });

    if (!rider) {
      return NextResponse.json(
        { success: false, message: 'Rider not found' },
        { status: 404 }
      );
    }

    // Soft-delete: deactivate rider and linked user
    await prisma.$transaction([
      prisma.rider.update({
        where: { id: riderId },
        data: { isActive: false, isOnline: false, isAvailable: false }
      }),
      prisma.user.update({
        where: { id: rider.userId },
        data: { isActive: false }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Rider removed successfully'
    });
  } catch (error: any) {
    console.error('Error deleting rider:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to remove rider' },
      { status: 500 }
    );
  }
}
