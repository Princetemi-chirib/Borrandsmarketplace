import { NextRequest, NextResponse } from 'next/server';
import PaystackService from '@/lib/paystack';

/**
 * GET /api/paystack/resolve-account?account_number=xxx&bank_code=yyy
 * Resolves Nigerian bank account number to account name (Paystack Resolve Account API).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const account_number = searchParams.get('account_number');
    const bank_code = searchParams.get('bank_code');

    if (!account_number?.trim() || !bank_code?.trim()) {
      return NextResponse.json(
        { success: false, error: 'account_number and bank_code are required' },
        { status: 400 }
      );
    }

    const result = await PaystackService.resolveBankAccount(account_number.trim(), bank_code.trim());
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Could not resolve account' },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      account_number: result.data?.account_number,
      account_name: result.data?.account_name,
    });
  } catch (error) {
    console.error('Paystack resolve-account error:', error);
    return NextResponse.json(
      { success: false, error: 'Account resolution failed' },
      { status: 500 }
    );
  }
}
