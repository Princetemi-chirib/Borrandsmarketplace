import { getTransporter, isEmailConfigured } from './email';

/**
 * Send email to one rider: new order available for delivery (order confirmed by restaurant).
 * All riders at the same university receive this when an order is confirmed.
 */
export async function sendNewOrderAvailableToRider(
  riderEmail: string,
  riderName: string,
  orderNumber: string,
  restaurantName: string,
  deliveryAddress: string,
  deliveryFee: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isEmailConfigured()) {
      const errorMsg = 'Email service is not configured.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const transporter = getTransporter();
    if (!transporter) {
      const errorMsg = 'Email credentials are missing.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: riderEmail,
      subject: `New delivery available – Order #${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .order-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .cta { display: inline-block; margin-top: 16px; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 New order available</h1>
            </div>
            <div class="content">
              <h2>Hi ${riderName},</h2>
              <p>A new order has been confirmed and is available for delivery. Log in to your rider dashboard to accept it.</p>
              <div class="order-box">
                <p><strong>Order:</strong> #${orderNumber}</p>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                <p><strong>Delivery address:</strong> ${deliveryAddress}</p>
                <p><strong>Delivery fee (your earnings):</strong> ₦${deliveryFee.toLocaleString()}</p>
              </div>
              <p>First rider to accept gets the delivery. Open the Borrands rider dashboard to see available orders.</p>
              <p>Best regards,<br><strong>The Borrands Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Borrands Marketplace</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${riderName},

A new order is available for delivery.

Order: #${orderNumber}
Restaurant: ${restaurantName}
Delivery address: ${deliveryAddress}
Delivery fee (your earnings): ₦${deliveryFee.toLocaleString()}

Log in to your rider dashboard to accept this delivery. First to accept gets it.

Best regards,
The Borrands Team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New order available email sent to ${riderEmail} for order #${orderNumber}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send new-order-available email to rider:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email notification to rider when assigned to an order
 */
export async function sendRiderAssignmentEmail(
  riderEmail: string,
  riderName: string,
  orderNumber: string,
  deliveryAddress: string,
  studentName: string,
  studentPhone: string | null,
  restaurantName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isEmailConfigured()) {
      const errorMsg = 'Email service is not configured.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const transporter = getTransporter();
    if (!transporter) {
      const errorMsg = 'Email credentials are missing.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: riderEmail,
      subject: `Delivery Assignment - Order #${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .assignment-box { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 Delivery Assignment</h1>
            </div>
            <div class="content">
              <h2>Hello ${riderName},</h2>
              <p>You have been assigned a new delivery.</p>
              <div class="assignment-box">
                <p><strong>Order Number:</strong> #${orderNumber}</p>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
                <p><strong>Customer:</strong> ${studentName}</p>
                ${studentPhone ? `<p><strong>Customer Phone:</strong> ${studentPhone}</p>` : ''}
              </div>
              <p>Please proceed to the restaurant to pick up the order and deliver it to the customer.</p>
              <p>Best regards,<br><strong>The Borrands Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Borrands Marketplace</p>
              <p>📧 support@borrands.com.ng | 🌐 www.borrands.com.ng</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${riderName},

You have been assigned a new delivery.

Order Number: #${orderNumber}
Restaurant: ${restaurantName}
Delivery Address: ${deliveryAddress}
Customer: ${studentName}
${studentPhone ? `Customer Phone: ${studentPhone}` : ''}

Please proceed to the restaurant to pick up the order and deliver it to the customer.

Best regards,
The Borrands Team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Rider assignment email sent to ${riderEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send rider assignment email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email notification to rider when order is cancelled/rejected
 */
export async function sendRiderCancellationEmail(
  riderEmail: string,
  riderName: string,
  orderNumber: string,
  restaurantName: string,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isEmailConfigured()) {
      const errorMsg = 'Email service is not configured.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const transporter = getTransporter();
    if (!transporter) {
      const errorMsg = 'Email credentials are missing.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: riderEmail,
      subject: `Order #${orderNumber} Cancelled - Delivery Assignment Cancelled`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .cancellation-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Delivery Cancelled</h1>
            </div>
            <div class="content">
              <h2>Hello ${riderName},</h2>
              <p>We're writing to inform you that the delivery assignment for the order below has been cancelled.</p>
              <div class="cancellation-box">
                <p><strong>Order Number:</strong> #${orderNumber}</p>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
              </div>
              <p>You no longer need to proceed with this delivery. We apologize for any inconvenience.</p>
              <p>You will be notified of new delivery assignments as they become available.</p>
              <p>Best regards,<br><strong>The Borrands Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Borrands Marketplace</p>
              <p>📧 support@borrands.com.ng | 🌐 www.borrands.com.ng</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${riderName},

We're writing to inform you that the delivery assignment for the order below has been cancelled.

Order Number: #${orderNumber}
Restaurant: ${restaurantName}
${rejectionReason ? `Reason: ${rejectionReason}` : ''}

You no longer need to proceed with this delivery. We apologize for any inconvenience.

You will be notified of new delivery assignments as they become available.

Best regards,
The Borrands Team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Rider cancellation email sent to ${riderEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send rider cancellation email:', error);
    return { success: false, error: error.message };
  }
}

