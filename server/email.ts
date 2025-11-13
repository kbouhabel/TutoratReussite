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
  
  if (!emailUser || !emailPass) {
    console.log("⚠️  Email credentials not configured. Skipping email send.");
    console.log("📋 Booking details:", {
      name: `${booking.firstName} ${booking.lastName}`,
      email: booking.email,
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.duration,
      location: booking.location,
      price: booking.price,
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  // Load and fill template
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
    // Send both emails
    await Promise.all([
      transporter.sendMail(clientMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);
    
    console.log("✅ Confirmation email sent successfully to:", booking.email);
    console.log("✅ Admin notification sent successfully to:", adminEmail);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}
