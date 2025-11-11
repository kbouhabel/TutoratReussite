import nodemailer from "nodemailer";
import type { Booking } from "@shared/schema";

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.log("Email credentials not configured. Skipping email send.");
    console.log("Booking details:", {
      name: `${booking.firstName} ${booking.lastName}`,
      email: booking.email,
      dateTime: booking.dateTime,
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

  const gradeLabel = booking.gradeLevel.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const locationLabel = booking.location === "teacher" ? "Chez le professeur" : "À domicile";
  
  const mailOptions = {
    from: emailUser,
    to: booking.email,
    subject: "Confirmation de réservation - TutoratRéussite",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4A90E2 0%, #FF8C42 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail-row { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; }
          .label { font-weight: bold; color: #4A90E2; }
          .value { margin-top: 5px; }
          .price { font-size: 24px; font-weight: bold; color: #22C55E; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TutoratRéussite</h1>
            <p>Confirmation de réservation</p>
          </div>
          <div class="content">
            <p>Bonjour ${booking.firstName} ${booking.lastName},</p>
            <p>Merci d'avoir réservé un cours avec TutoratRéussite. Voici les détails de votre réservation :</p>
            
            <div class="detail-row">
              <div class="label">Niveau scolaire</div>
              <div class="value">${gradeLabel}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Date et heure</div>
              <div class="value">${new Date(booking.dateTime).toLocaleString("fr-CA", {
                dateStyle: "full",
                timeStyle: "short",
              })}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Durée</div>
              <div class="value">${booking.duration}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Lieu</div>
              <div class="value">${locationLabel}${
        booking.address ? `<br>${booking.address}` : ""
      }</div>
            </div>
            
            <div class="price">
              Prix total : ${booking.price} $
            </div>
            
            <p>Nous vous contacterons prochainement au ${booking.phone} pour confirmer tous les détails.</p>
            
            <div class="footer">
              <p><strong>TutoratRéussite</strong></p>
              <p>123 Rue de l'Éducation, Montréal, QC H2X 1Y1</p>
              <p>(514) 555-0123 | info@tutoratreussite.ca</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully to:", booking.email);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
