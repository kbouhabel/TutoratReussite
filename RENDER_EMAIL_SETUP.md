# Email Configuration for Render Deployment

## Problem
Emails are not being sent when the app is deployed on Render, even though bookings are saved to the database.

## Solution Steps

### 1. Set Up Gmail App Password

Gmail requires an "App Password" for applications to send emails (standard passwords don't work):

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Go to **Security** → **App passwords**
4. Generate a new app password:
   - Select app: **Mail**
   - Select device: **Other (Custom name)** → Enter "TutoratReussite"
   - Click **Generate**
5. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

### 2. Configure Environment Variables on Render

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your web service (TutoratReussite)
3. Go to **Environment** tab
4. Add these environment variables:
   - **EMAIL_USER**: `tutoratreussite@gmail.com` (or your Gmail address)
   - **EMAIL_PASS**: Paste the 16-character app password from step 1 (remove spaces)

### 3. Redeploy Your Service

After adding the environment variables:
1. Click **Manual Deploy** → **Deploy latest commit**
2. Or simply push new code to trigger automatic deployment

### 4. Check Logs

After deployment, check the Render logs when a booking is made:
- Look for `📧 Email configuration check:` - should show both credentials as "✓ Set"
- Look for `✅ Email sent successfully` - confirms emails were sent
- Look for `❌ CRITICAL: Email sending failed` - shows any errors

## Common Issues

### Issue: "Invalid login credentials"
**Cause**: Using regular Gmail password instead of App Password
**Solution**: Generate and use an App Password (see Step 1)

### Issue: "Less secure app access"
**Cause**: Gmail blocking login attempts
**Solution**: App Passwords bypass this (no need to enable "less secure apps")

### Issue: Environment variables not set
**Cause**: EMAIL_USER or EMAIL_PASS missing on Render
**Solution**: Add both variables in Render dashboard (see Step 2)

### Issue: Template file not found
**Cause**: Email template not included in build
**Solution**: The updated code now checks for this and logs the error

## Testing Locally

To test email sending locally:

1. Create a `.env` file in the project root:
```bash
EMAIL_USER=tutoratreussite@gmail.com
EMAIL_PASS=your-app-password-here
```

2. Run the app and make a test booking
3. Check the console for email status messages

## Verification

After setup, you should see these logs when a booking is created:
```
📧 Email configuration check:
  EMAIL_USER: ✓ Set
  EMAIL_PASS: ✓ Set
  Admin Email: tutoratreussite@gmail.com
�� Creating email transporter...
✅ Email transporter verified successfully
📝 Loading email template...
📤 Sending emails...
✅ Confirmation email sent successfully to: customer@email.com
✅ Admin notification sent successfully to: tutoratreussite@gmail.com
```

## Support

If issues persist after following these steps:
1. Check Render logs for specific error messages
2. Verify the App Password is correct (try generating a new one)
3. Ensure the Gmail account has 2-Step Verification enabled
4. Contact Render support if there are network/firewall issues
