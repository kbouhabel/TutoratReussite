# Email Configuration for Render Deployment

## Problem
Emails are not being sent when the app is deployed on Render because:
1. **Render blocks SMTP ports** (587/465) on free tier for security
2. Gmail requires special configuration that doesn't work reliably on cloud platforms

## Solution: Use Resend API

Resend is a modern email API that works perfectly with Render and offers **3,000 free emails per month**.

### Step 1: Sign Up for Resend

1. Go to https://resend.com/
2. Sign up for a free account
3. Verify your email address

### Step 2: Get Your API Key

1. After logging in, go to **API Keys** in the dashboard
2. Click **Create API Key**
3. Name it "TutoratReussite Production"
4. Copy the API key (starts with `re_...`)

### Step 3: Configure Environment Variable on Render

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your web service (TutoratReussite)
3. Go to **Environment** tab
4. Add this environment variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: Paste your Resend API key from Step 2
5. Click **Save Changes**

### Step 4: Deploy

After adding the environment variable:
1. Push your updated code to GitHub (the email system now uses Resend instead of Gmail)
2. Render will automatically redeploy
3. Or click **Manual Deploy** → **Deploy latest commit**

### Step 5: Verify Email Domain (Optional but Recommended)

By default, emails are sent from `onboarding@resend.dev`. To use your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Add your domain (e.g., `tutoratreussite.com`)
4. Follow DNS configuration instructions
5. Once verified, update the `from` field in `server/email.ts`:
   ```typescript
   from: 'TutoratRéussite <noreply@tutoratreussite.com>',
   ```

## Testing

After deployment, check the Render logs when a booking is made:

```
📧 Email configuration check:
  RESEND_API_KEY: ✓ Set
  Admin Email: tutoratreussite@gmail.com
📧 Initializing Resend email service...
📝 Loading email template...
📤 Sending emails via Resend...
✅ Confirmation email sent to client: customer@email.com ID: xxx
✅ Admin notification sent to: tutoratreussite@gmail.com ID: xxx
```

## Why Resend Instead of Gmail?

| Feature | Gmail SMTP | Resend API |
|---------|------------|------------|
| Works on Render | ❌ No (ports blocked) | ✅ Yes (HTTP API) |
| Setup complexity | High (App Passwords) | Low (Just API key) |
| Reliability | Poor on cloud hosts | Excellent |
| Free tier | Limited | 3,000 emails/month |
| Deliverability | Good | Excellent |

## Testing Locally

To test email sending locally:

1. Get your Resend API key from https://resend.com/api-keys
2. Create a `.env` file in the project root:
```bash
RESEND_API_KEY=re_your_api_key_here
```
3. Run the app and make a test booking
4. Check the console for email status messages

## Troubleshooting

### Issue: "RESEND_API_KEY environment variable is required"
**Solution**: Add the API key in Render's Environment tab

### Issue: "Invalid API key"
**Solution**: Generate a new API key from Resend dashboard

### Issue: Emails not reaching inbox
**Solution**: 
- Check spam folder
- Verify domain in Resend (optional but improves deliverability)
- Check Resend dashboard for delivery status

### Issue: Template file not found
**Solution**: The build script automatically copies templates. Run `npm run build` to verify.

## Support

- Resend Documentation: https://resend.com/docs
- Resend Support: https://resend.com/support
- Check Render logs for detailed error messages
