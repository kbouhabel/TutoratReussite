import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  
  console.log("🔍 Testing Resend API...");
  console.log("API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "❌ MISSING");
  
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY not found in environment variables");
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  try {
    console.log("📤 Attempting to send test email...");
    
    const result = await resend.emails.send({
      from: 'TutoratRéussite <onboarding@resend.dev>',
      replyTo: 'tutoratreussite@gmail.com',
      to: 'tutoratreussite@gmail.com',
      subject: '🧪 Test Email from TutoratRéussite',
      html: '<h1>Test Successful!</h1><p>Your Resend integration is working correctly.</p>',
    });

    console.log("✅ Email sent successfully!");
    console.log("📧 Email ID:", result.data?.id);
    console.log("📊 Full response:", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("❌ Failed to send email");
    console.error("Error message:", error.message);
    console.error("Error details:", JSON.stringify(error, null, 2));
  }
}

testResend();
