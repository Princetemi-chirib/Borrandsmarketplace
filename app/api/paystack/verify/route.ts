import { NextRequest, NextResponse } from 'next/server';
import PaystackService from '@/lib/paystack';
import { dbConnect, prisma } from '@/lib/db-prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Reference is required' },
        { status: 400 }
      );
    }

    // Verify transaction with Paystack
    const result = await PaystackService.verifyTransaction(reference);

    if (result.success && result.data) {
      const transaction = result.data;
      
      // Check if payment was successful
      if (transaction.status === 'success') {
        await dbConnect();
        
        const metadata = transaction.metadata as any;
        
        if (metadata && metadata.cart && metadata.userId) {
          // Group cart items by restaurant
          const ordersByRestaurant = metadata.cart.reduce((acc: any, item: any) => {
            if (!acc[item.restaurantId]) {
              acc[item.restaurantId] = {
                restaurantId: item.restaurantId,
                restaurantName: item.restaurantName,
                items: []
              };
            }
            acc[item.restaurantId].items.push({
              itemId: item.itemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            });
            return acc;
          }, {});

          // Create orders for each restaurant
          const orderPromises = Object.values(ordersByRestaurant).map(async (orderData: any) => {
            const subtotal = orderData.items.reduce((sum: number, item: any) => 
              sum + (item.price * item.quantity), 0
            );
            
            // Get restaurant to calculate delivery fee
            const restaurant = await prisma.restaurant.findUnique({
              where: { id: orderData.restaurantId },
              select: { deliveryFee: true, estimatedDeliveryTime: true }
            });
            
            const deliveryFee = restaurant?.deliveryFee || 0;
            const total = subtotal + deliveryFee;
            const estimatedDeliveryTime = restaurant?.estimatedDeliveryTime || 30;
            
            // Generate unique order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            return await prisma.order.create({
              data: {
                studentId: metadata.userId,
                restaurantId: orderData.restaurantId,
                items: JSON.stringify(orderData.items),
                subtotal: subtotal,
                deliveryFee: deliveryFee,
                total: total,
                estimatedDeliveryTime: estimatedDeliveryTime,
                orderNumber: orderNumber,
                deliveryAddress: metadata.deliveryAddress?.address || '',
                deliveryInstructions: metadata.deliveryAddress?.instructions || '',
                deliveryPhone: metadata.phone || metadata.deliveryAddress?.phone || '',
                paymentMethod: 'CARD',
                paymentStatus: 'PAID',
                status: 'PENDING',
                paymentReference: reference,
              }
            });
          });

          const createdOrders = await Promise.all(orderPromises);
          
          console.log(`✅ Created ${createdOrders.length} order(s) for payment ${reference}`);

          return NextResponse.json({
            success: true,
            data: result.data,
            orders: createdOrders.map(o => ({ id: o.id, restaurantId: o.restaurantId })),
            message: 'Transaction verified and orders created successfully',
          });
        } else {
          console.warn('⚠️ Payment verified but missing metadata for order creation:', reference);
          return NextResponse.json({
            success: true,
            data: result.data,
            message: 'Transaction verified successfully (no order metadata)',
          });
        }
      } else {
        // Payment not successful
        return NextResponse.json({
          success: false,
          message: `Payment ${transaction.status}`,
        }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
