import { sendWhatsApp } from './whatsapp';
import { sendOrderNotificationEmail } from './email';

/**
 * Send notification to both email and WhatsApp
 */
export async function sendDualNotification(params: {
  email: string;
  phone?: string;
  name: string;
  subject: string;
  emailHtml?: string;
  whatsappMessage: string;
  orderDetails?: any;
}): Promise<{ emailSent: boolean; whatsappSent: boolean }> {
  const results = {
    emailSent: false,
    whatsappSent: false,
  };

  // Send email
  if (params.email) {
    try {
      if (params.orderDetails) {
        const emailResult = await sendOrderNotificationEmail(
          params.email,
          params.name,
          params.orderDetails.orderNumber || '',
          params.orderDetails.status || '',
          params.orderDetails
        );
        results.emailSent = emailResult.success;
      }
      console.log(results.emailSent ? '✅ Email sent' : '❌ Email failed');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  // Send WhatsApp
  if (params.phone) {
    try {
      await sendWhatsApp(params.phone, params.whatsappMessage);
      results.whatsappSent = true;
      console.log('✅ WhatsApp sent');
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
    }
  }

  return results;
}

/**
 * Send order status update notification (Email + WhatsApp)
 */
export async function sendOrderStatusNotification(params: {
  email: string;
  phone?: string;
  name: string;
  orderNumber: string;
  status: string;
  orderDetails: any;
}): Promise<void> {
  const statusEmoji: { [key: string]: string } = {
    'PENDING': '⏳',
    'ACCEPTED': '✅',
    'PREPARING': '👨‍🍳',
    'READY': '📦',
    'PICKED_UP': '🚚',
    'IN_TRANSIT': '🛵',
    'DELIVERED': '🎉',
    'CANCELLED': '❌',
  };

  const whatsappMessage = `${statusEmoji[params.status] || '📦'} *Order Update*\n\nHi ${params.name}!\n\nYour order *#${params.orderNumber}* is now: *${params.status}*\n\n📍 Restaurant: ${params.orderDetails.restaurantName || 'N/A'}\n💰 Total: ₦${params.orderDetails.total?.toLocaleString() || '0'}\n\nTrack your order in real-time on the Borrands app.\n\n_Borrands Marketplace - Your Campus Food Partner_ 🎓`;

  await sendDualNotification({
    email: params.email,
    phone: params.phone,
    name: params.name,
    subject: `Order ${params.status} - #${params.orderNumber}`,
    whatsappMessage,
    orderDetails: params,
  });
}

/**
 * Send new order notification to restaurant (Email + WhatsApp)
 */
export async function sendNewOrderNotificationToRestaurant(params: {
  email: string;
  phone?: string;
  restaurantName: string;
  orderNumber: string;
  orderDetails: any;
}): Promise<void> {
  const whatsappMessage = `🔔 *New Order Received!*\n\nRestaurant: ${params.restaurantName}\nOrder #${params.orderNumber}\n\n📦 Items: ${params.orderDetails.itemCount || 0}\n💰 Total: ₦${params.orderDetails.total?.toLocaleString() || '0'}\n📍 Delivery to: ${params.orderDetails.deliveryAddress || 'N/A'}\n\nPlease confirm and prepare the order.\n\n_Borrands Marketplace_ 🎓`;

  await sendDualNotification({
    email: params.email,
    phone: params.phone,
    name: params.restaurantName,
    subject: `New Order #${params.orderNumber}`,
    whatsappMessage,
    orderDetails: {
      orderNumber: params.orderNumber,
      status: 'PENDING',
      ...params.orderDetails,
    },
  });
}

/**
 * Send rider assignment notification (Email + WhatsApp)
 */
export async function sendRiderAssignmentNotification(params: {
  email: string;
  phone?: string;
  riderName: string;
  orderNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  earnings: number;
}): Promise<void> {
  const whatsappMessage = `🛵 *New Delivery Assignment*\n\nHi ${params.riderName}!\n\nYou have a new delivery:\n\n📦 Order: #${params.orderNumber}\n📍 Pickup: ${params.pickupAddress}\n📍 Deliver to: ${params.deliveryAddress}\n💰 Earnings: ₦${params.earnings.toLocaleString()}\n\nOpen the app to accept and start delivery.\n\n_Borrands Marketplace_ 🎓`;

  await sendDualNotification({
    email: params.email,
    phone: params.phone,
    name: params.riderName,
    subject: `New Delivery - #${params.orderNumber}`,
    whatsappMessage,
    orderDetails: {
      orderNumber: params.orderNumber,
      status: 'READY',
      restaurantName: params.pickupAddress,
      total: params.earnings,
    },
  });
}

export default {
  sendDualNotification,
  sendOrderStatusNotification,
  sendNewOrderNotificationToRestaurant,
  sendRiderAssignmentNotification,
};

