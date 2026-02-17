/**
 * Test the password reset email sender (sendPasswordResetEmail).
 * Uses TEST_OTP_EMAIL or TEST_RESET_EMAIL from env, or a default placeholder.
 *
 * Run: npm run test:password-reset-email  or  npx tsx scripts/test-password-reset-email.ts
 */

import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const { isEmailConfigured, sendPasswordResetEmail } = await import('../lib/services/email');

  const testEmail =
    process.env.TEST_RESET_EMAIL ||
    process.env.TEST_OTP_EMAIL ||
    process.env.MAIL_USERNAME ||
    'test@example.com';
  const testName = 'Test User';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const testResetLink = `${baseUrl}/auth/reset-password?token=test-token-12345`;

  console.log('--- Password Reset Email Test ---');
  console.log('Configured:', isEmailConfigured());
  console.log('Sending test reset email to:', testEmail);
  console.log('Reset link (example):', testResetLink);
  console.log('');

  const result = await sendPasswordResetEmail(testEmail, testName, testResetLink);

  if (result.success) {
    console.log('✅ SUCCESS: Password reset email sent. Check inbox (and spam) for:', testEmail);
  } else {
    console.log('❌ FAILED:', result.error);
  }

  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
