import nodemailer from "nodemailer";
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
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const adminEmail = "tutoratreussite@gmail.com";
  
  console.log("📧 Email configuration check:");
  console.log("  EMAIL_USER:", emailUser ? "✓ Set" : "✗ Missing");
  console.log("  EMAIL_PASS:", emailPass ? "✓ Set" : "✗ Missing");
  console.log("  Admin Email:", adminEmail);
  
  if (!emailUser || !emailPass) {
    const errorMsg = "⚠️  Email credentials not configured. EMAIL_USER and EMAIL_PASS environment variables are required.";
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

  console.log("📧 Creating email transporter...");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  // Verify transporter configuration
  try {
    await transporter.verify();
    console.log("✅ Email transporter verified successfully");
  } catch (verifyError) {
    console.error("❌ Email transporter verification failed:", verifyError);
    throw new Error(`Email configuration is invalid: ${verifyError}`);
  }

  // Load and fill template
  console.log("📝 Loading email template...");
  const template = loadEmailTemplate();
  const emailHtml = fillTemplate(template, booking);
  
  // Send to client
  const clientMailOptions = {
    from: `TutoratRéussite <${emailUser}>`,
    to: booking.email,
    subject: "✅ Confirmation de réservation - TutoratRéussite",
    html: emailHtml,
  };

  // Send to admin (tutoratreussite@gmail.com)
  const adminMailOptions = {
    from: `TutoratRéussite <${emailUser}>`,
    to: adminEmail,
    subject: `📚 Nouvelle réservation - ${booking.firstName} ${booking.lastName}`,
    html: emailHtml,
  };

  try {
    console.log("📤 Sending emails...");
    // Send both emails
    await Promise.all([
      transporter.sendMail(clientMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);
    
    console.log("✅ Confirmation email sent successfully to:", booking.email);
    console.log("✅ Admin notification sent successfully to:", adminEmail);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}
