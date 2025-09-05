import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/lib/models/Restaurant';
import User from '@/lib/models/User';

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
    
    const restaurant = await Restaurant.findById(params.id);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    if (restaurant.status !== 'pending') {
      return NextResponse.json(
        { error: 'Restaurant is not pending approval' },
        { status: 400 }
      );
    }
    
    if (action === 'approve') {
      restaurant.status = 'approved';
      restaurant.isOpen = true;
      restaurant.approvedAt = new Date();
      
      // Send approval notification to restaurant owner
      // TODO: Implement notification system
      
    } else if (action === 'reject') {
      restaurant.status = 'rejected';
      restaurant.rejectionReason = reason || 'Application rejected';
      restaurant.rejectedAt = new Date();
      
      // Send rejection notification to restaurant owner
      // TODO: Implement notification system
    }
    
    await restaurant.save();
    
    return NextResponse.json({
      message: `Restaurant ${action}d successfully`,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        status: restaurant.status
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
