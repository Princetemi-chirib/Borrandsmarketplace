/**
 * Quick test for the email sender (SMTP via Nodemailer).
 * Sends a simple "Test email" to verify your MAIL_* / SMTP_* config.
 *
 * Set recipient: TEST_EMAIL=you@example.com  (or uses MAIL_USERNAME)
 * Run: npm run test:email  or  npx tsx scripts/test-email-send.ts
 */

import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const { getTransporter, isEmailConfigured } = await import('../lib/services/email');

  const to = process.env.TEST_EMAIL || process.env.MAIL_USERNAME || process.env.SMTP_USER;
  if (!to) {
    console.error('❌ Set TEST_EMAIL or MAIL_USERNAME in .env.local');
    process.exit(1);
  }

  console.log('--- Email sender test ---');
  console.log('Configured:', isEmailConfigured());
  console.log('Sending to:', to);

  const transporter = getTransporter();
  if (!transporter) {
    console.error('❌ No transporter (missing MAIL_PASSWORD / SMTP_PASS?)');
    process.exit(1);
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || 'Borrands'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || 'noreply@borrands.com.ng'}>`,
      to,
      subject: 'Test email – Borrands',
      text: 'If you see this, your email sender is working.',
      html: '<p>If you see this, your email sender is <strong>working</strong>.</p>',
    });
    console.log('✅ Sent. Check inbox (and spam) for:', to);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Send failed:', err?.message || err);
    process.exit(1);
  }
}

main();



