import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { sendBookingConfirmation } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available time slots for booking
  app.get("/api/time-slots", async (req, res) => {
    try {
      const { date, duration } = req.query;
      
      if (!date || !duration) {
        return res.status(400).json({ error: "Date et durée sont requises" });
      }
      
      const requestedDate = new Date(date as string);
      const slots = await storage.getAvailableTimeSlots(requestedDate, duration as string);
      
      res.json(slots);
    } catch (error: any) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check availability for a specific time slot
  app.post("/api/check-availability", async (req, res) => {
    try {
      const { startTime, duration } = req.body;
      
      if (!startTime || !duration) {
        return res.status(400).json({ error: "startTime and duration are required" });
      }

      const requestedStart = new Date(startTime);
      const availability = await storage.checkAvailability(requestedStart, duration);
      
      res.json(availability);
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = {
        ...req.body,
        requestedStartTime: new Date(req.body.requestedStartTime),
        userId: null, // No authentication required
      };

      const validatedData = insertBookingSchema.parse(bookingData);
      
      const result = await storage.createBooking(validatedData);
      
      if (!result.success) {
        return res.status(409).json({ 
          error: result.error,
          nextAvailable: result.nextAvailable,
        });
      }

      try {
        await sendBookingConfirmation(result.booking!);
      } catch (emailError) {
        console.error("Email sending failed, but booking was created:", emailError);
      }
      
      res.status(201).json({
        message: `Réservation confirmée pour ${result.booking!.startTime.toLocaleString('fr-CA', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })} à ${result.booking!.endTime.toLocaleTimeString('fr-CA', { 
          timeStyle: 'short' 
        })}.`,
        booking: result.booking,
      });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      
      if (error.name === "ZodError") {
        res.status(400).json({ 
          error: "Validation error", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ error: "Failed to create booking" });
      }
    }
  });

  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const allBookings = await storage.getBookings();
      res.json(allBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Cancel a booking
  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      await storage.cancelBooking(req.params.id);
      res.json({ message: "Réservation annulée avec succès. Les créneaux sont maintenant disponibles." });
    } catch (error) {
      console.error("Error canceling booking:", error);
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
