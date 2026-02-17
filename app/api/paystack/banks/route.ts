import { NextResponse } from 'next/server';
import PaystackService from '@/lib/paystack';

/**
 * GET /api/paystack/banks
 * Returns list of Nigerian banks for payout account dropdown.
 * Uses Paystack List Banks API (no auth required for public list; we use secret server-side).
 */
export async function GET() {
  try {
    const result = await PaystackService.listBanks();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch banks' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, banks: result.data });
  } catch (error) {
    console.error('Paystack banks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banks' },
      { status: 500 }
    );
  }
}
