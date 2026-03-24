import { prisma } from '@/lib/db-prisma';
import PaystackService from '@/lib/paystack';

/** Minimum Paystack transfer amount for NGN (whole naira). */
const MIN_PAYOUT_NAIRA = 100;

/**
 * Payout is based on `order.subtotal` only (menu / meal line items).
 * Never uses `order.total`, which includes service charge and delivery fee — those stay with the platform.
 * Ratio 0–1: default 1 = full meal subtotal.
 */
function payoutNairaFromSubtotal(subtotal: number): number {
  const ratio = parseFloat(process.env.RESTAURANT_AUTO_PAYOUT_RATIO || '1');
  const r = Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : 1;
  return Math.floor(subtotal * r);
}

/**
 * After a paid card order is created, send restaurant share from Paystack balance if enabled.
 * Idempotent: skips if this order already has a terminal auto-payout status.
 */
export async function tryRestaurantAutoPayoutForOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          autoPayoutEnabled: true,
          payoutBankCode: true,
          payoutBankName: true,
          payoutAccountNumber: true,
          payoutAccountName: true,
          paystackRecipientCode: true,
        },
      },
    },
  });

  if (!order || order.paymentMethod !== 'CARD' || order.paymentStatus !== 'PAID') {
    return;
  }

  if (order.autoPayoutStatus === 'PAID' || order.autoPayoutStatus === 'PROCESSING') {
    return;
  }

  const restaurant = order.restaurant;
  if (!restaurant.autoPayoutEnabled) {
    return;
  }

  const bankCode = restaurant.payoutBankCode?.trim();
  const accountNumber = restaurant.payoutAccountNumber?.trim();
  const accountName = restaurant.payoutAccountName?.trim();

  if (!bankCode || !accountNumber || !accountName) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        autoPayoutStatus: 'FAILED',
        autoPayoutError: 'Complete payout bank details and verify account name',
      },
    });
    return;
  }

  // Meal money only — excludes deliveryFee and service charge (held in order.total / notes).
  const amountNaira = payoutNairaFromSubtotal(order.subtotal);
  if (amountNaira < MIN_PAYOUT_NAIRA) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        autoPayoutStatus: 'SKIPPED',
        autoPayoutAmount: amountNaira,
        autoPayoutError: `Below minimum transfer (₦${MIN_PAYOUT_NAIRA})`,
      },
    });
    return;
  }

  const amountKobo = amountNaira * 100;
  let recipient = restaurant.paystackRecipientCode?.trim() || '';

  if (!recipient) {
    const created = await PaystackService.createTransferRecipient({
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
    });
    if (!created.success || !created.recipient_code) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          autoPayoutStatus: 'FAILED',
          autoPayoutError: created.error?.slice(0, 512) || 'Could not create transfer recipient',
        },
      });
      return;
    }
    recipient = created.recipient_code;
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { paystackRecipientCode: recipient },
    });
  }

  const transferReference = `ap-${order.id}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      autoPayoutStatus: 'PROCESSING',
      autoPayoutAmount: amountNaira,
      autoPayoutTransferRef: transferReference,
      autoPayoutError: null,
    },
  });

  const transfer = await PaystackService.initiateTransfer({
    amountKobo,
    recipient,
    reason: `Order ${order.orderNumber}`,
    reference: transferReference,
  });

  if (!transfer.success) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        autoPayoutStatus: 'FAILED',
        autoPayoutError: transfer.error?.slice(0, 512) || 'Transfer failed',
      },
    });
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      autoPayoutStatus: 'PAID',
      autoPayoutTransferRef: transfer.transfer_code || transfer.reference || transferReference,
      autoPayoutError: null,
    },
  });
}
