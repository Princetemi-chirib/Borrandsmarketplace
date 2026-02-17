/**
 * Test the OTP email sender (sendVerificationEmail).
 * Uses TEST_OTP_EMAIL from env, or a default placeholder.
 *
 * Run: npm run test:otp-email  or  npx tsx scripts/test-otp-email.ts
 */

import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const { isEmailConfigured, sendVerificationEmail } = await import('../lib/services/email');

  const testEmail = process.env.TEST_OTP_EMAIL || process.env.MAIL_USERNAME || 'test@example.com';
  const testName = 'Test User';
  const testOtp = '123456';

  console.log('--- OTP Email Sender Test ---');
  console.log('Configured:', isEmailConfigured());
  console.log('Sending test OTP email to:', testEmail);
  console.log('');

  const result = await sendVerificationEmail(testEmail, testName, testOtp);

  if (result.success) {
    console.log('✅ SUCCESS: Verification email sent. Check inbox (and spam) for:', testEmail);
  } else {
    console.log('❌ FAILED:', result.error);
  }

  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
