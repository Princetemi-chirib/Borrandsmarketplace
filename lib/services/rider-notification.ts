import { getTransporter, isEmailConfigured } from './email';

/**
 * Send email notification to rider when assigned to an order
 */
export async function sendRiderAssignmentEmail(
  riderEmail: string,
  riderName: string,
  orderNumber: string,
  deliveryAddress: string,
  studentName: string,
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

