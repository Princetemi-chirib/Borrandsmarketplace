import axios from 'axios';
import { PaystackTransaction } from '@/types';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY!;

if (!PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY) {
  throw new Error('Paystack credentials not properly configured');
}

const paystackApi = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export class PaystackService {
  private static instance: PaystackService;

  private constructor() {}

  public static getInstance(): PaystackService {
    if (!PaystackService.instance) {
      PaystackService.instance = new PaystackService();
    }
    return PaystackService.instance;
  }

  async initializeTransaction(data: {
    email: string;
    amount: number;
    reference: string;
    callback_url: string;
    metadata?: any;
  }) {
    try {
      const response = await paystackApi.post('/transaction/initialize', {
        email: data.email,
        amount: data.amount * 100, // Convert to kobo (smallest currency unit)
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: data.metadata,
        currency: 'NGN',
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initialization failed',
      };
    }
  }

  async verifyTransaction(reference: string): Promise<{
    success: boolean;
    data?: PaystackTransaction;
    error?: string;
  }> {
    try {
      const response = await paystackApi.get(`/transaction/verify/${reference}`);
      
      const transaction = response.data.data;
      
      return {
        success: true,
        data: {
          reference: transaction.reference,
          amount: transaction.amount / 100, // Convert from kobo to naira
          currency: transaction.currency,
          status: transaction.status,
          gateway_response: transaction.gateway_response,
          paid_at: transaction.paid_at,
          channel: transaction.channel,
          ip_address: transaction.ip_address,
          metadata: transaction.metadata,
        },
      };
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Transaction verification failed',
      };
    }
  }

  async chargeCard(data: {
    email: string;
    amount: number;
    reference: string;
    authorization_code: string;
    metadata?: any;
  }) {
    try {
      const response = await paystackApi.post('/transaction/charge_authorization', {
        email: data.email,
        amount: data.amount * 100, // Convert to kobo
        reference: data.reference,
        authorization_code: data.authorization_code,
        metadata: data.metadata,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Paystack charge error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Card charging failed',
      };
    }
  }

  async refundTransaction(data: {
    transaction: string;
    amount?: number;
    reason?: string;
  }) {
    try {
      const response = await paystackApi.post('/refund', {
        transaction: data.transaction,
        amount: data.amount ? data.amount * 100 : undefined, // Convert to kobo if amount specified
        reason: data.reason,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Paystack refund error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Refund failed',
      };
    }
  }

  async getTransaction(reference: string) {
    try {
      const response = await paystackApi.get(`/transaction/${reference}`);
      
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Paystack get transaction error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get transaction',
      };
    }
  }

  async listTransactions(params: {
    page?: number;
    perPage?: number;
    status?: string;
    from?: string;
    to?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.perPage) queryParams.append('perPage', params.perPage.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.from) queryParams.append('from', params.from);
      if (params.to) queryParams.append('to', params.to);

      const response = await paystackApi.get(`/transaction?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error: any) {
      console.error('Paystack list transactions error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to list transactions',
      };
    }
  }

  generateReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `UM_${timestamp}_${random}`.toUpperCase();
  }

  formatAmount(amount: number): number {
    // Ensure amount is in kobo (smallest currency unit)
    return Math.round(amount * 100);
  }

  parseAmount(amount: number): number {
    // Convert from kobo to naira
    return amount / 100;
  }
}

export default PaystackService.getInstance();


