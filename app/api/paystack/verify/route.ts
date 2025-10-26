import { NextRequest, NextResponse } from 'next/server';
import PaystackService from '@/lib/paystack';

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

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Transaction verified successfully',
      });
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
