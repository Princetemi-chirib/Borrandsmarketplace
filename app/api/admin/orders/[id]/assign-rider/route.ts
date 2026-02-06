import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { getUserFromRequest } from '@/lib/auth';
import { sendRiderAssignmentEmail } from '@/lib/services/rider-notification';
import { sendOrderNotificationEmail } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { riderId } = body;

    if (!riderId) {
      return NextResponse.json({ success: false, message: 'Rider ID is required' }, { status: 400 });
    }

    // Get order with related data
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        rider: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Check if order is in a valid state for rider assignment (PENDING or ACCEPTED)
    if (order.status !== 'PENDING' && order.status !== 'ACCEPTED') {
      return NextResponse.json({ 
        success: false, 
        message: `Order must be PENDING or ACCEPTED before assigning a rider. Current status: ${order.status}` 
      }, { status: 400 });
    }

    // Check if order already has a rider assigned
    if (order.riderId) {
      return NextResponse.json({ 
        success: false, 
        message: `Order already has a rider assigned: ${order.rider?.name || 'Unknown'}` 
      }, { status: 400 });
    }

    // Get rider with user data
    const rider = await prisma.rider.findUnique({
      where: { id: riderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!rider || !rider.isActive) {
      return NextResponse.json({ success: false, message: 'Rider not found or inactive' }, { status: 404 });
    }

    // Determine new status based on current order status
    // If PENDING: keep as PENDING (awaiting restaurant acceptance)
    // If ACCEPTED: move to PREPARING (ready to prepare)
    const newStatus = order.status === 'ACCEPTED' ? 'PREPARING' : 'PENDING';

    // Assign rider to order
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        riderId: riderId,
        status: newStatus
      },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send email notification to rider
    if (rider.user.email) {
      try {
        const emailResult = await sendRiderAssignmentEmail(
          rider.user.email,
          rider.name,
          order.orderNumber,
          order.deliveryAddress,
          order.student.name,
          order.student.phone,
          order.restaurant.name
        );
        if (emailResult.success) {
          console.log(`✅ Rider assignment email sent successfully to ${rider.user.email} for order ${order.orderNumber}`);
        } else {
          console.error(`❌ Failed to send rider assignment email: ${emailResult.error}`);
        }
      } catch (error) {
        console.error('❌ Failed to send email to rider:', error);
        // Don't fail the request if email fails
      }
    } else {
      console.warn(`⚠️ Rider ${rider.name} (ID: ${rider.id}) does not have an email address. Assignment email not sent.`);
    }

    // Send email notification to student that rider has been assigned
    if (order.student.email) {
      try {
        let items;
        try {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (parseError) {
          console.error('Failed to parse order items:', parseError);
          items = [];
        }
        
        // Determine status message for student email
        const emailStatus = newStatus === 'PREPARING' ? 'PREPARING' : 'PENDING';
        const statusMessage = newStatus === 'PREPARING' 
          ? 'Your order is being prepared. A rider has been assigned to deliver your order.'
          : 'A rider has been assigned to your order. We are waiting for the restaurant to confirm your order.';
        
        await sendOrderNotificationEmail(
          order.student.email,
          order.student.name,
          order.orderNumber,
          emailStatus,
          {
            restaurantName: order.restaurant.name,
            total: order.total,
            deliveryAddress: order.deliveryAddress,
            items,
            riderName: rider.name,
            customMessage: statusMessage
          }
        );
      } catch (error) {
        console.error('Failed to send rider assignment notification to student:', error);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Rider assigned successfully',
      order: updatedOrder 
    });
  } catch (error: any) {
    console.error('Error assigning rider:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to assign rider' 
    }, { status: 500 });
  }
}

