import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { sendBookingConfirmation } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/time-slots", async (req, res) => {
    try {
      const slots = await storage.getAvailableTimeSlots();
      const slotDates = slots.map((slot) => slot.dateTime);
      res.json(slotDates);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ error: "Failed to fetch time slots" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = {
        ...req.body,
        dateTime: new Date(req.body.dateTime),
      };

      const validatedData = insertBookingSchema.parse(bookingData);
      
      const booking = await storage.createBooking(validatedData);
      
      try {
        await sendBookingConfirmation(booking);
      } catch (emailError) {
        console.error("Email sending failed, but booking was created:", emailError);
      }
      
      res.status(201).json(booking);
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

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
