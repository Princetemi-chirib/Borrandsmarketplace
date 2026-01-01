import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';

// POST /api/restaurants/[id]/approve - Approve or reject restaurant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { action, reason } = body; // action: 'approve' | 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id }
    });
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    if (restaurant.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Restaurant is not pending approval' },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    
    if (action === 'approve') {
      updateData.status = 'APPROVED';
      updateData.isApproved = true;
      updateData.isActive = true;
      updateData.isOpen = true;
      updateData.approvedAt = new Date();
      
      // Send approval notification to restaurant owner
      // TODO: Implement notification system
      
    } else if (action === 'reject') {
      updateData.status = 'REJECTED';
      updateData.rejectionReason = reason || 'Application rejected';
      updateData.rejectedAt = new Date();
      
      // Send rejection notification to restaurant owner
      // TODO: Implement notification system
    }
    
    const updated = await prisma.restaurant.update({
      where: { id: params.id },
      data: updateData
    });
    
    return NextResponse.json({
      message: `Restaurant ${action}d successfully`,
      restaurant: {
        _id: updated.id,
        name: updated.name,
        status: updated.status
      }
    });
    
  } catch (error) {
    console.error('Error processing restaurant approval:', error);
    return NextResponse.json(
      { error: 'Failed to process restaurant approval' },
      { status: 500 }
    );
  }
}
