import twilio from 'twilio';
import { WhatsAppMessage } from '@/types';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER!;

if (!accountSid || !authToken || !phoneNumber) {
  throw new Error('Twilio credentials not properly configured');
}

const client = twilio(accountSid, authToken);

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
    try {
      const messageData: any = {
        from: `whatsapp:${phoneNumber}`,
        to: `whatsapp:${to}`,
        body: body
      };

      if (mediaUrl) {
        messageData.mediaUrl = mediaUrl;
      }

      await client.messages.create(messageData);
      return true;
    } catch (error) {
      console.error('WhatsApp message sending failed:', error);
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

  async sendSupportMessage(
    phone: string,
    issue: string,
    ticketId: string
  ): Promise<boolean> {
    const message = `🆘 *Support Ticket Created*

Ticket ID: #${ticketId}
Issue: ${issue}

Our support team will get back to you within 24 hours. Thank you for your patience! 🙏`;

    return this.sendMessage(phone, message);
  }
}

export default WhatsAppService.getInstance();
