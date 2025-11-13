import { Resend } from "resend";
import type { Booking } from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load email template
function loadEmailTemplate(): string {
  const templatePath = path.join(__dirname, 'templates', 'booking-confirmation.html');
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    console.error("❌ Email template not found at:", templatePath);
    console.error("📂 Current directory:", __dirname);
    console.error("📂 Directory contents:", fs.readdirSync(__dirname));
    throw new Error(`Email template not found at ${templatePath}`);
  }
  
  return fs.readFileSync(templatePath, 'utf-8');
}

// Replace placeholders in template
function fillTemplate(template: string, booking: Booking): string {
  const gradeLabel = booking.gradeLevel
    .replace("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  
  const subjectLabel = booking.subject === "math" ? "Mathématiques" : "Sciences";
  
  let locationLabel = "";
  if (booking.location === "teacher") {
    locationLabel = "Chez le professeur";
  } else if (booking.location === "home") {
    locationLabel = `À domicile${booking.address ? ` - ${booking.address}` : ""}`;
  } else if (booking.location === "inperson-free") {
    locationLabel = "En personne (Gratuit)";
  }
  
  const dateTimeFormatted = new Date(booking.startTime).toLocaleString("fr-CA", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const startTimeFormatted = new Date(booking.startTime).toLocaleTimeString("fr-CA", {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const endTimeFormatted = new Date(booking.endTime).toLocaleTimeString("fr-CA", {
    hour: '2-digit',
    minute: '2-digit',
  });

  const priceDisplay = booking.price === 0 ? "GRATUIT" : `${booking.price} $`;

  return template
    .replace(/{{firstName}}/g, booking.firstName)
    .replace(/{{lastName}}/g, booking.lastName)
    .replace(/{{gradeLevel}}/g, gradeLabel)
    .replace(/{{subject}}/g, subjectLabel)
    .replace(/{{dateTime}}/g, `${dateTimeFormatted} (de ${startTimeFormatted} à ${endTimeFormatted})`)
    .replace(/{{duration}}/g, booking.duration)
    .replace(/{{location}}/g, locationLabel)
    .replace(/{{price}}/g, priceDisplay)
    .replace(/{{phone}}/g, booking.phone)
    .replace(/{{email}}/g, booking.email);
}

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = "tutoratreussite@gmail.com";
  
  console.log("📧 Email configuration check:");
  console.log("  RESEND_API_KEY:", resendApiKey ? "✓ Set" : "✗ Missing");
  console.log("  Admin Email:", adminEmail);
  
  if (!resendApiKey) {
    const errorMsg = "⚠️  Email credentials not configured. RESEND_API_KEY environment variable is required.";
    console.error(errorMsg);
    console.log("📋 Booking details:", {
      name: `${booking.firstName} ${booking.lastName}`,
      email: booking.email,
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.duration,
      location: booking.location,
      price: booking.price,
    });
    throw new Error(errorMsg);
  }

  console.log("📧 Initializing Resend email service...");
  const resend = new Resend(resendApiKey);

  // Load and fill template
  console.log("📝 Loading email template...");
  const template = loadEmailTemplate();
  const emailHtml = fillTemplate(template, booking);

  try {
    console.log("📤 Sending emails via Resend...");
    
    // Send to client
    const clientEmail = await resend.emails.send({
      from: 'TutoratRéussite <onboarding@resend.dev>',
      replyTo: 'tutoratreussite@gmail.com',
      to: booking.email,
      subject: "✅ Confirmation de réservation - TutoratRéussite",
      html: emailHtml,
    });

    console.log("📧 Client email response:", JSON.stringify(clientEmail, null, 2));
    
    if (clientEmail.error) {
      console.error("❌ Error sending client email:", clientEmail.error);
      throw new Error(`Failed to send client email: ${JSON.stringify(clientEmail.error)}`);
    }
    
    if (!clientEmail.data?.id) {
      console.error("⚠️ No email ID returned. Full response:", clientEmail);
      throw new Error("Email sent but no ID returned - check Resend API key permissions");
    }

    console.log("✅ Confirmation email sent to client:", booking.email, "ID:", clientEmail.data.id);

    // Send to admin
    const adminEmailResult = await resend.emails.send({
      from: 'TutoratRéussite <onboarding@resend.dev>',
      replyTo: 'tutoratreussite@gmail.com',
      to: adminEmail,
      subject: `📚 Nouvelle réservation - ${booking.firstName} ${booking.lastName}`,
      html: emailHtml,
    });

    console.log("📧 Admin email response:", JSON.stringify(adminEmailResult, null, 2));
    
    if (adminEmailResult.error) {
      console.error("❌ Error sending admin email:", adminEmailResult.error);
      throw new Error(`Failed to send admin email: ${JSON.stringify(adminEmailResult.error)}`);
    }
    
    if (!adminEmailResult.data?.id) {
      console.error("⚠️ No email ID returned for admin. Full response:", adminEmailResult);
      throw new Error("Admin email sent but no ID returned - check Resend API key permissions");
    }

    console.log("✅ Admin notification sent to:", adminEmail, "ID:", adminEmailResult.data.id);
  } catch (error) {
    console.error("❌ Error sending email via Resend:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}
