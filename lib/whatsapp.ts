import twilio from 'twilio';
import { WhatsAppMessage } from '@/types';

// Helper: normalize phone numbers to E.164
function normalizeE164(raw: string): string {
  if (!raw) return raw;
  const trimmed = raw.replace(/\s+/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  // Nigeria local format like 070..., convert to +23470...
  if (/^0\d{10}$/.test(trimmed)) {
    return `+234${trimmed.slice(1)}`;
  }
  return trimmed;
}

// Function to get Twilio configuration dynamically
function getTwilioConfig() {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const phoneNumberRaw = (process.env.TWILIO_PHONE_NUMBER || '').trim();
  const phoneNumber = normalizeE164(phoneNumberRaw);
  
  // Debug logging
  console.log('🔍 Twilio Config Debug:', {
    accountSid: accountSid ? `${accountSid.slice(0, 6)}...` : 'missing',
    authToken: authToken ? `${authToken.slice(0, 6)}...` : 'missing',
    phoneNumberRaw: phoneNumberRaw || 'missing'
  });
  
  const isConfigured = Boolean(accountSid && authToken && phoneNumber);
  console.log('🔍 Twilio Configured:', isConfigured, 'Phone:', phoneNumber);
  
  return { accountSid, authToken, phoneNumber, isConfigured };
}

// Initialize client
let client: any = null;
let lastConfigCheck = 0;
const CONFIG_CACHE_DURATION = 5000; // 5 seconds

function initializeClient() {
  const now = Date.now();
  if (now - lastConfigCheck < CONFIG_CACHE_DURATION) {
    return client; // Return cached client
  }
  
  lastConfigCheck = now;
  const { accountSid, authToken, phoneNumber, isConfigured } = getTwilioConfig();
  
  if (isConfigured) {
    try {
      client = twilio(accountSid as string, authToken as string);
      const maskedSid = accountSid ? `${accountSid.slice(0, 6)}...` : 'unknown';
      console.log(`✅ Twilio WhatsApp configured (SID ${maskedSid})`);
    } catch (error) {
      console.error('❌ Failed to initialize Twilio client:', error);
      client = null;
    }
  } else {
    console.warn('⚠️ Twilio credentials not configured. WhatsApp notifications will be disabled.');
    console.log('To enable WhatsApp notifications, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env.local');
    client = null;
  }
  
  return client;
}

export class WhatsAppService {
  private static instance: WhatsAppService;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  async sendMessage(to: string, body: string, mediaUrl?: string): Promise<boolean> {
    const { phoneNumber, isConfigured } = getTwilioConfig();
    const currentClient = initializeClient();
    
    const fromWhatsapp = `whatsapp:${phoneNumber}`;
    const toWhatsapp = `whatsapp:${normalizeE164(to)}`;

    if (!isConfigured || !currentClient) {
      console.log('📱 WhatsApp message (disabled):', { from: fromWhatsapp, to: toWhatsapp, body, mediaUrl });
      return true; // simulate success in development
    }

    try {
      const messageData: any = {
        from: fromWhatsapp,
        to: toWhatsapp,
        body
      };

      if (mediaUrl) {
        messageData.mediaUrl = mediaUrl;
      }

      const message = await currentClient.messages.create(messageData);
      console.log('✅ WhatsApp message sent successfully:', message.sid);
      return true;
    } catch (error) {
      console.error('❌ WhatsApp message sending failed:', error);
      return false;
    }
  }

  async sendOrderConfirmation(
    phone: string,
    orderId: string,
    restaurantName: string,
    total: number,
    estimatedTime: string
  ): Promise<boolean> {
    const message = `🍽️ *Order Confirmed!*

Order ID: #${orderId}
Restaurant: ${restaurantName}
Total: ₦${total.toLocaleString()}
Estimated Delivery: ${estimatedTime}

We'll keep you updated on your order status! 🚀`;
    
    return this.sendMessage(phone, message);
  }

  async sendOrderStatusUpdate(
    phone: string,
    orderId: string,
    status: string,
    additionalInfo?: string
  ): Promise<boolean> {
    const statusMessages: { [key: string]: string } = {
      confirmed: '✅ Your order has been confirmed and is being prepared!',
      preparing: '👨‍🍳 Your order is being prepared in the kitchen!',
      ready: '📦 Your order is ready for pickup!',
      picked_up: '🚚 Your order has been picked up and is on its way!',
      in_transit: '🛵 Your order is being delivered to you!',
      delivered: '🎉 Your order has been delivered! Enjoy your meal!'
    };

    const message = `📱 *Order Status Update*

Order ID: #${orderId}
Status: ${statusMessages[status] || status}

${additionalInfo ? `\n${additionalInfo}` : ''}`;

    return this.sendMessage(phone, message);
  }

  async sendPaymentConfirmation(
    phone: string,
    orderId: string,
    amount: number,
    paymentMethod: string
  ): Promise<boolean> {
    const message = `💳 *Payment Confirmed!*

Order ID: #${orderId}
Amount: ₦${amount.toLocaleString()}
Payment Method: ${paymentMethod}

Thank you for your payment! Your order is being processed. 🎉`;

    return this.sendMessage(phone, message);
  }

  async sendLowStockAlert(
    phone: string,
    restaurantName: string,
    itemName: string,
    currentStock: number
  ): Promise<boolean> {
    const message = `⚠️ *Low Stock Alert*

Restaurant: ${restaurantName}
Item: ${itemName}
Current Stock: ${currentStock}

Please restock this item soon to avoid running out! 📦`;

    return this.sendMessage(phone, message);
  }

  async sendDeliveryRequest(
    phone: string,
    orderId: string,
    restaurantName: string,
    deliveryAddress: string,
    estimatedEarnings: number
  ): Promise<boolean> {
    const message = `🚚 *New Delivery Request*

Order ID: #${orderId}
Restaurant: ${restaurantName}
Delivery Address: ${deliveryAddress}
Estimated Earnings: ₦${estimatedEarnings.toLocaleString()}

Would you like to accept this delivery?

Reply with:
✅ ACCEPT - to accept the delivery
❌ DECLINE - to decline the delivery`;

    return this.sendMessage(phone, message);
  }

  async sendDeliveryAccepted(
    phone: string,
    orderId: string,
    riderName: string,
    estimatedPickupTime: string
  ): Promise<boolean> {
    const message = `✅ *Delivery Accepted*

Order ID: #${orderId}
Rider: ${riderName}
Estimated Pickup: ${estimatedPickupTime}

Your rider will pick up your order soon! 🛵`;

    return this.sendMessage(phone, message);
  }

  async sendOrderCancelled(
    phone: string,
    orderId: string,
    reason?: string
  ): Promise<boolean> {
    const message = `❌ *Order Cancelled*

Order ID: #${orderId}
${reason ? `Reason: ${reason}` : ''}

If you have any questions, please contact our support team.`;

    return this.sendMessage(phone, message);
  }

  async sendWelcomeMessage(
    phone: string,
    userName: string,
    role: string
  ): Promise<boolean> {
    const roleMessages: { [key: string]: string } = {
      student: 'Welcome to University Marketplace! 🎓\n\nYou can now browse restaurants, place orders, and track deliveries in real-time.',
      restaurant: 'Welcome to University Marketplace! 🏪\n\nYou can now manage your menu, receive orders, and grow your business.',
      rider: 'Welcome to University Marketplace! 🛵\n\nYou can now accept delivery requests and earn money by delivering orders.'
    };

    const message = `🎉 *Welcome ${userName}!*

${roleMessages[role] || 'Welcome to University Marketplace!'}

We\'re excited to have you on board! 🚀`;

    return this.sendMessage(phone, message);
  }

  isConfigured(): boolean {
    const { isConfigured } = getTwilioConfig();
    const currentClient = initializeClient();
    return Boolean(isConfigured && currentClient !== null);
  }

  getConfigStatus(): { configured: boolean; message: string } {
    const { accountSid, authToken, phoneNumber, isConfigured } = getTwilioConfig();
    const currentClient = initializeClient();
    
    if (isConfigured && currentClient) {
      return { configured: true, message: 'WhatsApp service is active and ready' };
    }
    if (!accountSid || !authToken || !phoneNumber) {
      return { configured: false, message: 'Twilio credentials are missing' };
    }
    return { configured: false, message: 'Twilio client initialization failed' };
  }
}

// Function to send OTP via WhatsApp
export async function sendWhatsAppOTP(phone: string, otp: string): Promise<boolean> {
  const { phoneNumber, isConfigured } = getTwilioConfig();
  const currentClient = initializeClient();
  
  const fromWhatsapp = `whatsapp:${phoneNumber}`;
  const toWhatsapp = `whatsapp:${normalizeE164(phone)}`;

  if (!isConfigured || !currentClient) {
    console.log('📱 WhatsApp OTP (disabled):', { from: fromWhatsapp, to: toWhatsapp, otp });
    return true; // simulate success in development
  }

  try {
    const message = `🔐 *Your Verification Code*

Your OTP code is: *${otp}*

This code will expire in 10 minutes.
Do not share this code with anyone.

If you didn't request this code, please ignore this message.`;

    const messageData: any = {
      from: fromWhatsapp,
      to: toWhatsapp,
      body: message
    };

    const result = await currentClient.messages.create(messageData);
    console.log('✅ WhatsApp OTP sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('❌ WhatsApp OTP sending failed:', error);
    return false;
  }
}

export default WhatsAppService.getInstance();


