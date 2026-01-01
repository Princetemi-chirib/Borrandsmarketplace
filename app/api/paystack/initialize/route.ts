import { NextRequest, NextResponse } from 'next/server';
import PaystackService from '@/lib/paystack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, reference, callback_url, metadata } = body;

    // Validate required fields
    if (!email || !amount || !reference || !callback_url) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize payment with Paystack
    const result = await PaystackService.initializeTransaction({
      email,
      amount,
      reference,
      callback_url,
      metadata,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Payment initialized successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    // Check if it's a credentials configuration error
    if (error.message?.includes('credentials not properly configured') || error.message?.includes('Paystack credentials')) {
      return NextResponse.json(
        { success: false, message: 'Paystack payment gateway is not configured. Please contact support.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
