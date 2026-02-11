import { NextRequest, NextResponse } from 'next/server';
import PaystackService from '@/lib/paystack';
import { dbConnect, prisma } from '@/lib/db-prisma';
import { sendNewOrderEmailToRestaurant, sendOrderPlacedEmailToStudent } from '@/lib/services/email';

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
        
        // Parse metadata - Paystack stores complex objects as strings
        let cart: any[] = [];
        let deliveryAddress: any = {};
        
        try {
          cart = typeof metadata.cart === 'string' ? JSON.parse(metadata.cart) : metadata.cart || [];
          deliveryAddress = typeof metadata.deliveryAddress === 'string' ? JSON.parse(metadata.deliveryAddress) : metadata.deliveryAddress || {};
        } catch (parseError) {
          console.error('Error parsing metadata:', parseError);
          console.log('Raw metadata:', metadata);
        }
        
        if (metadata && cart && Array.isArray(cart) && cart.length > 0 && metadata.userId) {
          // Check if orders already exist for this payment reference
          const existingOrders = await prisma.order.findMany({
            where: { paymentReference: reference },
            select: { id: true, orderNumber: true }
          });

          if (existingOrders.length > 0) {
            console.log(`⚠️ Orders already exist for payment reference ${reference}. Returning existing orders.`);
            return NextResponse.json({
              success: true,
              data: result.data,
              orders: existingOrders.map(o => ({ id: o.id })),
              message: 'Transaction verified (orders already created)',
            });
          }

          // Group cart items by restaurant
          const ordersByRestaurant = cart.reduce((acc: any, item: any) => {
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

          // Get student information for email notification
          const student = await prisma.user.findUnique({
            where: { id: metadata.userId },
            select: {
              id: true,
              name: true,
              email: true
            }
          });

          // Create orders for each restaurant
          const orderPromises = Object.values(ordersByRestaurant).map(async (orderData: any) => {
            const subtotal = orderData.items.reduce((sum: number, item: any) => 
              sum + (item.price * item.quantity), 0
            );
            
            // Get restaurant to calculate delivery fee and check open/closed
            const restaurant = await prisma.restaurant.findUnique({
              where: { id: orderData.restaurantId },
              select: { 
                id: true,
                name: true,
                isOpen: true,
                isApproved: true,
                isActive: true,
                deliveryFee: true, 
                estimatedDeliveryTime: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            });
            
            // If restaurant is missing or not active/approved, skip creating order
            if (!restaurant || !restaurant.isApproved || !restaurant.isActive) {
              console.warn(`Skipping order creation: restaurant ${orderData.restaurantId} not active/approved`);
              return null;
            }

            // If restaurant is closed, skip order creation for this restaurant
            if (!restaurant.isOpen) {
              console.warn(`Skipping order creation: restaurant ${orderData.restaurantId} is closed`);
              return null;
            }

            const SERVICE_CHARGE = 150;
            const DELIVERY_FEE = 350; // Use fixed delivery fee to match /api/orders
            const total = subtotal + SERVICE_CHARGE + DELIVERY_FEE;
            const estimatedDeliveryTime = restaurant?.estimatedDeliveryTime || 30;
            
            // Generate unique order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const createdOrder = await prisma.order.create({
              data: {
                studentId: metadata.userId,
                restaurantId: orderData.restaurantId,
                items: JSON.stringify(orderData.items),
                subtotal: subtotal,
                deliveryFee: DELIVERY_FEE,
                total: total,
                notes: `serviceCharge=${SERVICE_CHARGE}`,
                estimatedDeliveryTime: estimatedDeliveryTime,
                orderNumber: orderNumber,
                deliveryAddress: deliveryAddress?.address || metadata.deliveryAddress?.address || '',
                deliveryInstructions: deliveryAddress?.instructions || metadata.deliveryAddress?.instructions || '',
                deliveryPhone: metadata.phone || deliveryAddress?.phone || metadata.deliveryAddress?.phone || '',
                paymentMethod: 'CARD',
                paymentStatus: 'PAID',
                status: 'PENDING',
                paymentReference: reference,
              }
            });

            // Send new order email to restaurant
            if (restaurant?.user?.email) {
              try {
                await sendNewOrderEmailToRestaurant(
                  restaurant.user.email,
                  restaurant.name,
                  orderNumber,
                  {
                    items: orderData.items,
                    deliveryAddress: deliveryAddress?.address || metadata.deliveryAddress?.address || '',
                    deliveryInstructions: deliveryAddress?.instructions || metadata.deliveryAddress?.instructions || '',
                    total, subtotal, deliveryFee: DELIVERY_FEE
                  }
                );
              } catch (emailError) {
                console.error('Failed to send new order email to restaurant:', emailError);
              }
            }

            return { createdOrder, orderData, restaurantName: restaurant?.name || 'Restaurant' };
          });

          const createdOrdersWithData = (await Promise.all(orderPromises)).filter(Boolean) as Array<any>;
          const createdOrders = createdOrdersWithData.map(item => item.createdOrder);
          
          console.log(`✅ Created ${createdOrders.length} order(s) for payment ${reference}`);

          // Send order placed confirmation email to student (one email for all orders)
          if (student?.email && createdOrders.length > 0) {
            try {
              // Use the first order's details for the email
              const firstOrderData = createdOrdersWithData[0];
              const firstOrder = firstOrderData.createdOrder;

              await sendOrderPlacedEmailToStudent(
                student.email,
                student.name || 'Student',
                firstOrder.orderNumber,
                firstOrderData.restaurantName,
                {
                  items: firstOrderData.orderData.items,
                  deliveryAddress: deliveryAddress?.address || metadata.deliveryAddress?.address || '',
                  deliveryInstructions: deliveryAddress?.instructions || metadata.deliveryAddress?.instructions || '',
                  total: firstOrder.total,
                  subtotal: firstOrder.subtotal,
                  deliveryFee: firstOrder.deliveryFee
                }
              );
            } catch (emailError) {
              console.error('Failed to send order placed email to student:', emailError);
              // Don't fail the request if email fails
            }
          }

          // Note: Admin notification is sent when restaurant ACCEPTS the order (not on creation)
          // This ensures the admin is only notified when there's an order ready for rider assignment

          return NextResponse.json({
            success: true,
            data: result.data,
            orders: createdOrders.map(o => ({ id: o.id, restaurantId: o.restaurantId })),
            message: 'Transaction verified and orders created successfully',
          });
        } else {
          console.warn('⚠️ Payment verified but missing metadata for order creation:', reference);
          console.log('Metadata received:', JSON.stringify(metadata, null, 2));
          console.log('Parsed cart:', cart);
          console.log('Parsed deliveryAddress:', deliveryAddress);
          console.log('UserId:', metadata?.userId);
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
