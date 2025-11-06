import twilio from 'twilio';

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

export type WhatsAppTemplate =
  | 'order_confirmed'
  | 'order_preparing'
  | 'order_ready'
  | 'order_picked_up'
  | 'order_delivered'
  | 'order_cancelled';

let client: twilio.Twilio | null = null;
function getClient() {
  if (!client) client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  return client;
}

export async function sendWhatsApp(toPhoneE164: string, body: string) {
  const cli = getClient();
  return cli.messages.create({
    from: WHATSAPP_FROM,
    to: `whatsapp:${toPhoneE164}`,
    body,
  });
}

export function renderOrderTemplate(tpl: WhatsAppTemplate, data: { orderNumber: string; restaurantName?: string }) {
  const rname = data.restaurantName || 'Your restaurant';
  switch (tpl) {
    case 'order_confirmed':
      return `✅ ${rname}: Order ${data.orderNumber} confirmed. We'll start preparing shortly.`;
    case 'order_preparing':
      return `🍳 ${rname}: Order ${data.orderNumber} is now being prepared.`;
    case 'order_ready':
      return `📦 ${rname}: Order ${data.orderNumber} is ready for pickup.`;
    case 'order_picked_up':
      return `🚚 ${rname}: Order ${data.orderNumber} has been picked up.`;
    case 'order_delivered':
      return `🎉 ${rname}: Order ${data.orderNumber} has been delivered. Enjoy!`;
    case 'order_cancelled':
      return `⚠️ ${rname}: Order ${data.orderNumber} has been cancelled.`;
  }
}













