# Email Configuration for Production Deployment

## Issue
The error "Missing credentials for 'PLAIN'" occurs because SMTP email credentials are not configured in your production environment.

## Solution

### Step 1: Set Environment Variables in Production

Add these environment variables to your deployment platform (Vercel, Netlify, Railway, etc.):

#### Required Variables:
```
MAIL_HOST=mail.borrands.com.ng
MAIL_PORT=465
MAIL_USERNAME=support@borrands.com.ng
MAIL_PASSWORD=your_actual_email_password
MAIL_FROM_NAME=Borrands
MAIL_FROM_ADDRESS=noreply@borrands.com.ng
```

#### Alternative Variable Names (also supported):
```
SMTP_HOST=mail.borrands.com.ng
SMTP_PORT=465
SMTP_USER=support@borrands.com.ng
SMTP_PASS=your_actual_email_password
```

### Step 2: Platform-Specific Instructions

#### For Vercel:
1. Go to your project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `MAIL_HOST`
   - `MAIL_PORT`
   - `MAIL_USERNAME`
   - `MAIL_PASSWORD`
   - `MAIL_FROM_NAME`
   - `MAIL_FROM_ADDRESS`
4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**
6. Redeploy your application

#### For Netlify:
1. Go to **Site settings** → **Environment variables**
2. Add each variable
3. Click **Save**
4. Trigger a new deployment

#### For Railway:
1. Go to your project → **Variables**
2. Add each variable
3. The app will automatically redeploy

#### For Other Platforms:
Add the environment variables through your platform's dashboard or CLI.

### Step 3: Verify Configuration

After setting the variables and redeploying:
1. Try the "Resend OTP" feature
2. Check the logs for:
   - ✅ "Verification email sent successfully" (success)
   - ❌ "Email service is not configured" (credentials missing)

## Email Provider Options

### Option 1: Use Your Domain Email (Current Setup)
If you have `mail.borrands.com.ng`:
- Use your cPanel/hosting email credentials
- Port: 465 (SSL) or 587 (TLS)
- Username: full email address
- Password: your email account password

### Option 2: Use Gmail (Recommended for Testing)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Go to App Passwords
   - Generate a new app password for "Mail"
3. Use these settings:
   ```
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_16_char_app_password
   ```

### Option 3: Use SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com (free tier available)
2. Create an API key
3. Use these settings:
   ```
   MAIL_HOST=smtp.sendgrid.net
   MAIL_PORT=587
   MAIL_USERNAME=apikey
   MAIL_PASSWORD=your_sendgrid_api_key
   ```

### Option 4: Use AWS SES
1. Set up AWS SES
2. Get SMTP credentials
3. Use AWS SES SMTP settings

## Testing

After configuration, test email sending:
1. Try registering a new user
2. Try resending OTP
3. Check email inbox (and spam folder)
4. Verify OTP code works

## Troubleshooting

### Error: "Missing credentials for 'PLAIN'"
- **Cause**: `MAIL_PASSWORD` is empty or not set
- **Fix**: Add `MAIL_PASSWORD` environment variable with your email password

### Error: "Email authentication failed"
- **Cause**: Wrong username or password
- **Fix**: Double-check `MAIL_USERNAME` and `MAIL_PASSWORD`

### Error: "Could not connect to email server"
- **Cause**: Wrong host or port
- **Fix**: Verify `MAIL_HOST` and `MAIL_PORT` are correct

### Works Locally but Not in Production
- **Cause**: Environment variables not set in production
- **Fix**: Add all email environment variables to your deployment platform

## Security Notes

⚠️ **Important**:
- Never commit email passwords to git
- Use environment variables only
- Use app-specific passwords when possible (Gmail)
- Rotate passwords regularly
- Consider using a dedicated email service (SendGrid, AWS SES) for production

## Current Status

✅ Email service updated with better error handling
✅ Supports both MAIL_* and SMTP_* variable names
✅ Validates credentials before attempting to send
⚠️ **Action Required**: Set email environment variables in your production deployment platform







