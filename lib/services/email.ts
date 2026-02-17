import nodemailer from 'nodemailer';

// Check if email credentials are configured
export const isEmailConfigured = () => {
  const host = process.env.MAIL_HOST || process.env.SMTP_HOST;
  const user = process.env.MAIL_USERNAME || process.env.SMTP_USER;
  const pass = process.env.MAIL_PASSWORD || process.env.SMTP_PASS;
  
  return !!(host && user && pass);
};

// Email transporter configuration
export const getTransporter = () => {
  // Support both MAIL_* and SMTP_* environment variable names
  const host = process.env.MAIL_HOST || process.env.SMTP_HOST || 'mail.borrands.com.ng';
  const port = parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '465');
  const user = process.env.MAIL_USERNAME || process.env.SMTP_USER || 'support@borrands.com.ng';
  const pass = process.env.MAIL_PASSWORD || process.env.SMTP_PASS || '';

  // If password is empty, return null to indicate email is not configured
  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // use SSL for port 465, TLS for others
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send email verification OTP
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      const errorMsg = 'Email service is not configured. Please set MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD environment variables.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const transporter = getTransporter();
    if (!transporter) {
      const errorMsg = 'Email credentials are missing. Please configure MAIL_PASSWORD or SMTP_PASS environment variable.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

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
    
    // Provide more helpful error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your MAIL_USERNAME and MAIL_PASSWORD environment variables.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your MAIL_HOST and MAIL_PORT environment variables.';
    }
    
    return { success: false, error: errorMessage };
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
    // Check if email is configured
    if (!isEmailConfigured()) {
      const errorMsg = 'Email service is not configured. Please set MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD environment variables.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const transporter = getTransporter();
    if (!transporter) {
      const errorMsg = 'Email credentials are missing. Please configure MAIL_PASSWORD or SMTP_PASS environment variable.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }
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
                ${orderDetails.riderName ? `<p><strong>Assigned Rider:</strong> ${orderDetails.riderName}</p>` : ''}
                <p><strong>Total:</strong> ₦${orderDetails.total?.toLocaleString() || '0'}</p>
                ${orderDetails.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress}</p>` : ''}
              </div>
              ${orderDetails.customMessage ? `<p>${orderDetails.customMessage}</p>` : '<p>Track your order in real-time on the Borrands app.</p>'}
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

/**
 * Send new order notification to restaurant with accept/reject options
 */
export async function sendNewOrderEmailToRestaurant(
  email: string,
  restaurantName: string,
  orderNumber: string,
  orderDetails: any
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isEmailConfigured()) {
      const errorMsg = 'Email service is not configured. Please set MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD environment variables.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const transporter = getTransporter();
    if (!transporter) {
      const errorMsg = 'Email credentials are missing. Please configure MAIL_PASSWORD or SMTP_PASS environment variable.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const items = typeof orderDetails.items === 'string' ? JSON.parse(orderDetails.items) : orderDetails.items;
    const itemsList = Array.isArray(items) ? items.map((item: any) => 
      `${item.name} x${item.quantity} - ₦${item.total?.toLocaleString() || item.price?.toLocaleString()}`
    ).join('<br>') : 'N/A';

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: email,
      subject: `New Order #${orderNumber} - Action Required`,
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
            .items-list { margin: 10px 0; }
            .action-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 New Order Received</h1>
            </div>
            <div class="content">
              <h2>Hi ${restaurantName}!</h2>
              <p>You have received a new order. Please review and accept or reject it.</p>
              <div class="order-box">
                <p><strong>Order Number:</strong> #${orderNumber}</p>
                <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress || 'N/A'}</p>
                <p><strong>Total:</strong> ₦${orderDetails.total?.toLocaleString() || '0'}</p>
                <p><strong>Items:</strong></p>
                <div class="items-list">${itemsList}</div>
                ${orderDetails.deliveryInstructions ? `<p><strong>Delivery Instructions:</strong> ${orderDetails.deliveryInstructions}</p>` : ''}
              </div>
              <div class="action-box">
                <p><strong>⚠️ Action Required:</strong></p>
                <p>Please log in to your restaurant dashboard to accept or reject this order. You can provide a reason if rejecting.</p>
              </div>
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
    console.log(`✅ New order email sent to restaurant ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order rejection notification to student
 */
export async function sendOrderRejectionEmailToStudent(
  email: string,
  studentName: string,
  orderNumber: string,
  restaurantName: string,
  rejectionReason: string
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
      to: email,
      subject: `Order #${orderNumber} Rejected`,
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
            .rejection-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Order Rejected</h1>
            </div>
            <div class="content">
              <h2>Hi ${studentName}!</h2>
              <p>We regret to inform you that your order has been rejected by the restaurant.</p>
              <div class="rejection-box">
                <p><strong>Order Number:</strong> #${orderNumber}</p>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                <p><strong>Reason:</strong> ${rejectionReason}</p>
              </div>
              <p>If you have any questions or concerns, please contact our support team.</p>
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
    console.log(`✅ Order rejection email sent to student ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get admin email addresses for order notifications (new order + assign rider).
 * Set ADMIN_ORDER_EMAILS in .env (comma-separated) to override.
 */
export function getAdminOrderNotificationEmails(): string[] {
  const env = process.env.ADMIN_ORDER_EMAILS || '';
  if (env.trim()) {
    return env.split(',').map((e) => e.trim()).filter(Boolean);
  }
  return ['Miebaijoan15@gmail.com', 'Borrands1@gmail.com', 'Hassanakiye@gmail.com'];
}

/**
 * Send new order notification to admin when order is created
 */
export async function sendNewOrderNotificationToAdmin(
  orderNumber: string,
  restaurantName: string,
  studentName: string,
  orderDetails: any
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

    const adminEmails = getAdminOrderNotificationEmails();
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for order notifications (ADMIN_ORDER_EMAILS).');
      return { success: true };
    }
    const items = typeof orderDetails.items === 'string' ? JSON.parse(orderDetails.items) : orderDetails.items;
    const itemsList = Array.isArray(items) ? items.map((item: any) => 
      `${item.name} x${item.quantity} - ₦${(item.price * item.quantity)?.toLocaleString() || item.total?.toLocaleString() || '0'}`
    ).join('<br>') : 'N/A';

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: adminEmails.join(', '),
      subject: `New Order #${orderNumber} - Monitoring Required`,
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
            .info-box { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 New Order Created</h1>
            </div>
            <div class="content">
              <h2>New Order Notification</h2>
              <p>A new order has been placed and is awaiting restaurant confirmation.</p>
              <div class="order-box">
                <p><strong>Order Number:</strong> #${orderNumber}</p>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                <p><strong>Student:</strong> ${studentName}</p>
                <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress || 'N/A'}</p>
                ${orderDetails.deliveryInstructions ? `<p><strong>Delivery Instructions:</strong> ${orderDetails.deliveryInstructions}</p>` : ''}
                <p><strong>Total:</strong> ₦${orderDetails.total?.toLocaleString() || '0'}</p>
                <p><strong>Items:</strong></p>
                <div>${itemsList}</div>
              </div>
              <div class="info-box">
                <p><strong>ℹ️ Status:</strong></p>
                <p>The restaurant will review and confirm this order. You will be notified when the order is accepted and rider assignment is required.</p>
              </div>
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
      text: `New Order Notification

A new order has been placed and is awaiting restaurant confirmation.

Order Number: #${orderNumber}
Restaurant: ${restaurantName}
Student: ${studentName}
Delivery Address: ${orderDetails.deliveryAddress || 'N/A'}
${orderDetails.deliveryInstructions ? `Delivery Instructions: ${orderDetails.deliveryInstructions}\n` : ''}Total: ₦${orderDetails.total?.toLocaleString() || '0'}

Items:
${Array.isArray(items) ? items.map((item: any) => `  ${item.name} x${item.quantity} - ₦${(item.price * item.quantity)?.toLocaleString() || item.total?.toLocaleString() || '0'}`).join('\n') : 'N/A'}

Status: The restaurant will review and confirm this order. You will be notified when the order is accepted and rider assignment is required.

Best regards,
The Borrands Team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New order notification sent to admin emails: ${adminEmails.join(', ')}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order acceptance notification to admin (assign rider required).
 * Recipients: ADMIN_ORDER_EMAILS env or default Miebaijoan15@gmail.com, Borrands1@gmail.com, Hassanakiye@gmail.com
 */
export async function sendOrderAcceptanceNotificationToAdmin(
  orderNumber: string,
  restaurantName: string,
  studentName: string,
  orderDetails: any
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

    const adminEmails = getAdminOrderNotificationEmails();
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for order notifications (ADMIN_ORDER_EMAILS).');
      return { success: true };
    }
    const items = typeof orderDetails.items === 'string' ? JSON.parse(orderDetails.items) : orderDetails.items;
    const itemsList = Array.isArray(items) ? items.map((item: any) => 
      `${item.name} x${item.quantity} - ₦${item.total?.toLocaleString() || item.price?.toLocaleString()}`
    ).join('<br>') : 'N/A';

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: adminEmails.join(', '),
      subject: `Order #${orderNumber} Accepted - Rider Assignment Required`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .order-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .action-box { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Accepted</h1>
            </div>
            <div class="content">
              <h2>Order Accepted - Rider Assignment Required</h2>
              <p>An order has been accepted by the restaurant and requires rider assignment.</p>
              <div class="order-box">
                <p><strong>Order Number:</strong> #${orderNumber}</p>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                <p><strong>Student:</strong> ${studentName}</p>
                <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress || 'N/A'}</p>
                <p><strong>Total:</strong> ₦${orderDetails.total?.toLocaleString() || '0'}</p>
                <p><strong>Items:</strong></p>
                <div>${itemsList}</div>
              </div>
              <div class="action-box">
                <p><strong>⚠️ Action Required:</strong></p>
                <p>Please log in to the admin dashboard to assign a rider to this order.</p>
              </div>
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
    console.log(`✅ Order acceptance notification sent to admin`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order acceptance notification to student
 */
export async function sendOrderAcceptanceEmailToStudent(
  email: string,
  studentName: string,
  orderNumber: string,
  restaurantName: string,
  orderDetails: any
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

    const items = typeof orderDetails.items === 'string' ? JSON.parse(orderDetails.items) : orderDetails.items;
    const itemsList = Array.isArray(items) ? items.map((item: any) => 
      `${item.name} x${item.quantity} - ₦${item.total?.toLocaleString() || item.price?.toLocaleString()}`
    ).join('<br>') : 'N/A';

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: email,
      subject: `Order #${orderNumber} Accepted! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .order-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Accepted!</h1>
            </div>
            <div class="content">
              <h2>Hi ${studentName}!</h2>
              <p>Great news! Your order has been accepted by the restaurant and is being prepared.</p>
              <div class="order-box">
                <p><strong>Order Number:</strong> #${orderNumber}</p>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress || 'N/A'}</p>
                <p><strong>Total:</strong> ₦${orderDetails.total?.toLocaleString() || '0'}</p>
                <p><strong>Items:</strong></p>
                <div>${itemsList}</div>
                ${orderDetails.deliveryInstructions ? `<p><strong>Delivery Instructions:</strong> ${orderDetails.deliveryInstructions}</p>` : ''}
              </div>
              <div class="success-box">
                <p><strong>📦 What's Next?</strong></p>
                <p>Your order is now being prepared. A rider will be assigned shortly, and you'll receive updates as your order progresses.</p>
                <p>You can track your order in real-time on the Borrands app.</p>
              </div>
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
    console.log(`✅ Order acceptance email sent to student ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order placed confirmation email to student
 */
export async function sendOrderPlacedEmailToStudent(
  email: string,
  studentName: string,
  orderNumber: string,
  restaurantName: string,
  orderDetails: any
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

    const items = typeof orderDetails.items === 'string' ? JSON.parse(orderDetails.items) : orderDetails.items;
    const itemsList = Array.isArray(items) ? items.map((item: any) => 
      `${item.name} x${item.quantity} - ₦${(item.price * item.quantity)?.toLocaleString() || item.total?.toLocaleString() || '0'}`
    ).join('<br>') : 'N/A';

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: email,
      subject: `Order #${orderNumber} Placed Successfully! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .order-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Placed Successfully!</h1>
            </div>
            <div class="content">
              <h2>Hi ${studentName}!</h2>
              <div class="success-box">
                <p style="margin: 0; font-size: 18px; font-weight: 600;">Thank you for your order!</p>
                <p style="margin: 10px 0 0 0;">Your order has been received and is being processed.</p>
              </div>
              <div class="order-box">
                <p><strong>Order Number:</strong> #${orderNumber}</p>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress || 'N/A'}</p>
                ${orderDetails.deliveryInstructions ? `<p><strong>Delivery Instructions:</strong> ${orderDetails.deliveryInstructions}</p>` : ''}
                <p><strong>Items:</strong></p>
                <div style="margin-left: 20px;">${itemsList}</div>
                <p style="margin-top: 15px;"><strong>Subtotal:</strong> ₦${orderDetails.subtotal?.toLocaleString() || '0'}</p>
                ${orderDetails.deliveryFee ? `<p><strong>Delivery Fee:</strong> ₦${orderDetails.deliveryFee?.toLocaleString() || '0'}</p>` : ''}
                <p style="font-size: 18px; font-weight: 600; margin-top: 15px; padding-top: 15px; border-top: 2px solid #dee2e6;"><strong>Total:</strong> ₦${orderDetails.total?.toLocaleString() || '0'}</p>
              </div>
              <p><strong>What's next?</strong></p>
              <ul>
                <li>The restaurant will review and confirm your order</li>
                <li>You'll receive an email when your order is accepted</li>
                <li>A rider will be assigned to deliver your order</li>
                <li>You can track your order status in real-time on your dashboard</li>
              </ul>
              <p>We'll keep you updated every step of the way!</p>
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
      text: `Hi ${studentName}!

Thank you for your order!

Your order has been received and is being processed.

Order Number: #${orderNumber}
Restaurant: ${restaurantName}
Delivery Address: ${orderDetails.deliveryAddress || 'N/A'}
${orderDetails.deliveryInstructions ? `Delivery Instructions: ${orderDetails.deliveryInstructions}\n` : ''}
Items:
${Array.isArray(items) ? items.map((item: any) => `  ${item.name} x${item.quantity} - ₦${(item.price * item.quantity)?.toLocaleString() || item.total?.toLocaleString() || '0'}`).join('\n') : 'N/A'}

Subtotal: ₦${orderDetails.subtotal?.toLocaleString() || '0'}
${orderDetails.deliveryFee ? `Delivery Fee: ₦${orderDetails.deliveryFee?.toLocaleString() || '0'}\n` : ''}Total: ₦${orderDetails.total?.toLocaleString() || '0'}

What's next?
- The restaurant will review and confirm your order
- You'll receive an email when your order is accepted
- A rider will be assigned to deliver your order
- You can track your order status in real-time on your dashboard

We'll keep you updated every step of the way!

Best regards,
The Borrands Team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order placed email sent to student ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email with link
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isEmailConfigured()) {
      const errorMsg = 'Email service is not configured. Please set MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD environment variables.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const transporter = getTransporter();
    if (!transporter) {
      const errorMsg = 'Email credentials are missing. Please configure MAIL_PASSWORD or SMTP_PASS environment variable.';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@borrands.com.ng'}>`,
      to: email,
      subject: 'Reset Your Password - Borrands Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .link-fallback { word-break: break-all; font-size: 12px; color: #666; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Your Password</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>You requested a password reset for your <strong>Borrands Marketplace</strong> account.</p>
              <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </p>
              <p class="link-fallback">If the button doesn't work, copy and paste this link into your browser:<br>${resetLink}</p>
              <div class="warning">
                <strong>⚠️ Security:</strong> If you didn't request this, you can safely ignore this email. Your password will not be changed.
              </div>
              <p>Best regards,<br><strong>The Borrands Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Borrands Marketplace. All rights reserved.</p>
              <p>📧 support@borrands.com.ng | 🌐 www.borrands.com.ng</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${name},\n\nYou requested a password reset. Visit this link to set a new password (expires in 1 hour):\n${resetLink}\n\nIf you didn't request this, ignore this email.\n\nBest regards,\nThe Borrands Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Password reset email error:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderNotificationEmail,
  sendNewOrderEmailToRestaurant,
  sendOrderRejectionEmailToStudent,
  sendOrderAcceptanceNotificationToAdmin,
  sendOrderAcceptanceEmailToStudent,
  sendOrderPlacedEmailToStudent,
  sendNewOrderNotificationToAdmin,
};

