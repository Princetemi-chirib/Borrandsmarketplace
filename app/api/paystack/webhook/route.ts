import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect, prisma } from '@/lib/db-prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        // Payment was successful
        const transaction = event.data;
        console.log('Payment successful:', transaction.reference);
        
        // Here you would:
        // 1. Update order status to 'paid'
        // 2. Send confirmation email/SMS
        // 3. Update inventory
        // 4. Notify restaurant
        
        break;

      case 'transfer.success': {
        const ref: string | undefined = event.data?.reference;
        console.log('Transfer successful:', ref);
        if (ref?.startsWith('ap-')) {
          const orderId = ref.slice(3);
          try {
            await dbConnect();
            await prisma.order.updateMany({
              where: { id: orderId, autoPayoutStatus: 'PROCESSING' },
              data: { autoPayoutStatus: 'PAID', autoPayoutError: null },
            });
          } catch (e) {
            console.error('Webhook: failed to mark order paid for transfer', orderId, e);
          }
        }
        break;
      }

      case 'transfer.failed': {
        const ref: string | undefined = event.data?.reference;
        const reason =
          event.data?.failures?.[0]?.reason ||
          event.data?.message ||
          'Transfer failed';
        console.log('Transfer failed:', ref, reason);
        if (ref?.startsWith('ap-')) {
          const orderId = ref.slice(3);
          try {
            await dbConnect();
            await prisma.order.updateMany({
              where: { id: orderId },
              data: {
                autoPayoutStatus: 'FAILED',
                autoPayoutError: String(reason).slice(0, 512),
              },
            });
          } catch (e) {
            console.error('Webhook: failed to mark order payout failed', orderId, e);
          }
        }
        break;
      }

      case 'charge.failed':
        // Payment failed
        console.log('Payment failed:', event.data.reference);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
