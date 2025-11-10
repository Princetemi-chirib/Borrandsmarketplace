import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'mail.borrands.com.ng',
  port: parseInt(process.env.MAIL_PORT || '465'),
  secure: true, // use SSL
  auth: {
    user: process.env.MAIL_USERNAME || 'support@borrands.com.ng',
    pass: process.env.MAIL_PASSWORD || '',
  },
});

/**
 * Send email verification OTP
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: email,
      subject: 'Verify Your Email - Borrands Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .otp-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace; }
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to Borrands!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for registering with <strong>Borrands Marketplace</strong> - your campus food delivery platform.</p>
              <p>To complete your registration, please verify your email address using the OTP code below:</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>

              <p>Enter this code on the verification page to activate your account and start ordering delicious food from your favorite campus restaurants!</p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Borrands staff will never ask for your OTP.
              </div>

              <p style="margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
              
              <p>Best regards,<br><strong>The Borrands Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Borrands Marketplace. All rights reserved.</p>
              <p>📧 support@borrands.com.ng | 🌐 www.borrands.com.ng</p>
              <p style="margin-top: 15px; font-size: 11px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${name},

        Welcome to Borrands Marketplace!

        Your email verification code is: ${otp}

        This code will expire in 10 minutes.

        Enter this code on the verification page to activate your account.

        If you didn't create an account, you can safely ignore this email.

        Best regards,
        The Borrands Team
        support@borrands.com.ng
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order notification email
 */
export async function sendOrderNotificationEmail(
  email: string,
  name: string,
  orderNumber: string,
  status: string,
  orderDetails: any
): Promise<{ success: boolean; error?: string }> {
  try {
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

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: email,
      subject: `Order ${statusEmoji[status] || ''} ${status} - #${orderNumber}`,
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
            .order-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .status-badge { display: inline-block; background: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 10px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusEmoji[status] || '📦'} Order Update</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>Your order has been updated:</p>
              <div class="order-box">
                <p><strong>Order Number:</strong> #${orderNumber}</p>
                <p><strong>Status:</strong> <span class="status-badge">${status}</span></p>
                <p><strong>Restaurant:</strong> ${orderDetails.restaurantName || 'N/A'}</p>
                <p><strong>Total:</strong> ₦${orderDetails.total?.toLocaleString() || '0'}</p>
              </div>
              <p>Track your order in real-time on the Borrands app.</p>
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
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order notification email sent to ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendVerificationEmail,
  sendOrderNotificationEmail,
};

