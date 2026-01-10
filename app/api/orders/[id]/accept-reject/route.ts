import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { verifyAppRequest } from '@/lib/auth-app';
import { sendOrderRejectionEmailToStudent, sendOrderAcceptanceNotificationToAdmin, sendOrderAcceptanceEmailToStudent } from '@/lib/services/email';
import { sendRiderCancellationEmail } from '@/lib/services/rider-notification';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = verifyAppRequest(request);
    if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { action, rejectionReason } = body; // action: 'accept' or 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ message: 'Invalid action. Must be "accept" or "reject"' }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ message: 'Rejection reason is required' }, { status: 400 });
    }

    // Get order with related data
    const order = await prisma.order.findFirst({
      where: { 
        id: params.id, 
        restaurantId: auth.restaurantId,
        status: 'PENDING' // Only allow accept/reject for pending orders
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logo: true,
            image: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        rider: {
          select: {
            id: true,
            name: true,
            email: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found or already processed' }, { status: 404 });
    }

    if (action === 'reject') {
      // Update order status to CANCELLED and add rejection reason
      const updatedOrder = await prisma.order.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
          rejectionReason,
          rejectedAt: new Date(),
          cancelledAt: new Date()
        }
      });

      // Send rejection email to student
      if (order.student.email) {
        try {
          await sendOrderRejectionEmailToStudent(
            order.student.email,
            order.student.name,
            order.orderNumber,
            order.restaurant.name,
            rejectionReason
          );
        } catch (error) {
          console.error('Failed to send rejection email:', error);
          // Don't fail the request if email fails
        }
      }

      // Send cancellation email to rider if rider was assigned
      if (order.rider && order.rider.user?.email) {
        try {
          await sendRiderCancellationEmail(
            order.rider.user.email,
            order.rider.name,
            order.orderNumber,
            order.restaurant.name,
            rejectionReason
          );
        } catch (error) {
          console.error('Failed to send rider cancellation email:', error);
          // Don't fail the request if email fails
        }
      }

      return NextResponse.json({ 
        message: 'Order rejected successfully',
        order: updatedOrder 
      });
    } else {
      // Accept order - update status based on whether rider is already assigned
      // If rider is assigned: move directly to PREPARING
      // If no rider: move to ACCEPTED
      const newStatus = order.riderId ? 'PREPARING' : 'ACCEPTED';
      
      const updatedOrder = await prisma.order.update({
        where: { id: params.id },
        data: {
          status: newStatus
        }
      });

      // Parse items once for reuse
      let items;
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (parseError) {
        console.error('Failed to parse order items:', parseError);
        items = [];
      }

      // Send acceptance notification to admin and Miebaijoan15@gmail.com
      try {
        await sendOrderAcceptanceNotificationToAdmin(
          order.orderNumber,
          order.restaurant.name,
          order.student.name,
          {
            items,
            deliveryAddress: order.deliveryAddress,
            deliveryInstructions: order.deliveryInstructions,
            total: order.total,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee
          }
        );
      } catch (error) {
        console.error('Failed to send acceptance notification to admin:', error);
        // Don't fail the request if email fails
      }

      // Send acceptance email to student
      if (order.student.email) {
        try {
          await sendOrderAcceptanceEmailToStudent(
            order.student.email,
            order.student.name,
            order.orderNumber,
            order.restaurant.name,
            {
              items,
              deliveryAddress: order.deliveryAddress,
              deliveryInstructions: order.deliveryInstructions,
              total: order.total,
              subtotal: order.subtotal,
              deliveryFee: order.deliveryFee
            }
          );
        } catch (error) {
          console.error('Failed to send acceptance email to student:', error);
          // Don't fail the request if email fails
        }
      }

      return NextResponse.json({ 
        message: 'Order accepted successfully',
        order: updatedOrder 
      });
    }
  } catch (e: any) {
    console.error('Error processing order accept/reject:', e);
    return NextResponse.json({ message: e.message || 'Failed to process order' }, { status: 500 });
  }
}


