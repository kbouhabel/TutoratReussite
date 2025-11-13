import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { type Booking, type InsertBooking, bookings } from "@shared/schema";
import { eq, and, or, gte, lte, desc } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

// Working hours: 8:00 AM to 8:00 PM
const WORKING_HOURS = {
  START_HOUR: 8,
  START_MINUTE: 0,
  END_HOUR: 20,
  END_MINUTE: 0,
};

const BUFFER_MINUTES = 30;

// Define fixed time slots
const TIME_SLOTS = [
  { start: "08:00", end: "09:30", duration: 90 },  // 1h30
  { start: "10:00", end: "12:00", duration: 120 }, // 2h
  { start: "12:30", end: "14:00", duration: 90 },  // 1h30
  { start: "14:30", end: "16:00", duration: 90 },  // 1h30
  { start: "16:30", end: "18:30", duration: 120 }, // 2h
  { start: "19:00", end: "20:00", duration: 60 },  // 1h
];

// Convert duration string to minutes
function durationToMinutes(duration: string): number {
  switch (duration) {
    case "1h": return 60;
    case "1h30": return 90;
    case "2h": return 120;
    default: return 60;
  }
}

// Parse time string (HH:MM) and set it to a date
function setTimeOnDate(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

// Get the duration of a time slot in minutes
function getSlotDuration(slot: { start: string; end: string }): number {
  const [startHours, startMinutes] = slot.start.split(':').map(Number);
  const [endHours, endMinutes] = slot.end.split(':').map(Number);
  return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
}

// Check if a time slot can accommodate the requested duration
function canSlotAccommodateDuration(slot: { start: string; end: string }, duration: string): boolean {
  const slotDurationMinutes = getSlotDuration(slot);
  const requestedDurationMinutes = durationToMinutes(duration);
  return slotDurationMinutes >= requestedDurationMinutes;
}

// Check if a time slot matches the requested duration exactly
function slotMatchesDuration(slot: { start: string; end: string; duration: number }, requestedDuration: string): boolean {
  const requestedMinutes = durationToMinutes(requestedDuration);
  // Only show slots that match exactly the requested duration
  return slot.duration === requestedMinutes;
}

export interface IStorage {
  createBooking(booking: InsertBooking): Promise<{ success: boolean; booking?: Booking; error?: string; nextAvailable?: Date }>;
  getBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  getAvailableTimeSlots(date: Date, duration: string): Promise<Array<{ start: string; end: string; startDateTime: Date }>>;
  getAllAvailableTimeSlots(date: Date): Promise<Array<{ start: string; end: string; startDateTime: Date; duration: string; durationMinutes: number }>>;
  checkAvailability(requestedStart: Date, requestedEnd: Date): Promise<{ available: boolean; reason?: string; nextAvailable?: Date }>;
  cancelBooking(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async checkAvailability(requestedStart: Date, requestedEnd: Date): Promise<{ available: boolean; reason?: string; nextAvailable?: Date }> {
    // Calculate all time boundaries with buffers
    const bufferStart = new Date(requestedStart);
    bufferStart.setMinutes(bufferStart.getMinutes() - BUFFER_MINUTES);
    
    const bufferEnd = new Date(requestedEnd);
    bufferEnd.setMinutes(bufferEnd.getMinutes() + BUFFER_MINUTES);
    
    // Get all bookings for the same day
    const dayStart = new Date(requestedStart);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(requestedStart);
    dayEnd.setHours(23, 59, 59, 999);
    
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.status, 'confirmed'),
          gte(bookings.startTime, dayStart),
          lte(bookings.startTime, dayEnd)
        )
      );
    
    // Check for conflicts with existing bookings (including their buffers)
    for (const booking of existingBookings) {
      // Calculate buffer times dynamically from stored start/end times
      const existingBufferStart = new Date(booking.startTime);
      existingBufferStart.setMinutes(existingBufferStart.getMinutes() - BUFFER_MINUTES);
      
      const existingBufferEnd = new Date(booking.endTime);
      existingBufferEnd.setMinutes(existingBufferEnd.getMinutes() + BUFFER_MINUTES);
      
      // Check if there's any overlap
      const hasOverlap = (
        (bufferStart >= existingBufferStart && bufferStart < existingBufferEnd) ||
        (bufferEnd > existingBufferStart && bufferEnd <= existingBufferEnd) ||
        (bufferStart <= existingBufferStart && bufferEnd >= existingBufferEnd)
      );
      
      if (hasOverlap) {
        return {
          available: false,
          reason: `Indisponible. Un cours est déjà réservé de ${existingBufferStart.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })} à ${existingBufferEnd.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })} (incluant les temps de déplacement).`,
          nextAvailable: existingBufferEnd,
        };
      }
    }
    
    return { available: true };
  }

  async createBooking(insertBooking: InsertBooking): Promise<{ success: boolean; booking?: Booking; error?: string; nextAvailable?: Date }> {
    const requestedStart = insertBooking.requestedStartTime;
    const durationMinutes = durationToMinutes(insertBooking.duration);
    const requestedEnd = new Date(requestedStart);
    requestedEnd.setMinutes(requestedEnd.getMinutes() + durationMinutes);
    
    // Check availability
    const availabilityCheck = await this.checkAvailability(requestedStart, requestedEnd);
    
    if (!availabilityCheck.available) {
      return {
        success: false,
        error: availabilityCheck.reason,
        nextAvailable: availabilityCheck.nextAvailable,
      };
    }
    
    // Create the booking (only store actual start and end times)
    const [booking] = await db.insert(bookings).values({
      ...insertBooking,
      startTime: requestedStart,
      endTime: requestedEnd,
    }).returning();
    
    return { success: true, booking };
  }

  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.startTime));
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return booking;
  }

  async cancelBooking(id: string): Promise<void> {
    await db.update(bookings)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(bookings.id, id));
  }

  async getAvailableTimeSlots(date: Date, duration: string): Promise<Array<{ start: string; end: string; startDateTime: Date }>> {
    const availableSlots: Array<{ start: string; end: string; startDateTime: Date }> = [];
    
    // Filter slots that match EXACTLY the requested duration (no longer slots)
    const suitableSlots = TIME_SLOTS.filter(slot => slotMatchesDuration(slot, duration));
    
    // Check availability for each suitable slot
    for (const slot of suitableSlots) {
      const startDateTime = setTimeOnDate(date, slot.start);
      const endDateTime = setTimeOnDate(date, slot.end);
      
      const availability = await this.checkAvailability(startDateTime, endDateTime);
      
      if (availability.available) {
        availableSlots.push({
          start: slot.start,
          end: slot.end,
          startDateTime,
        });
      }
    }
    
    return availableSlots;
  }

  async getAllAvailableTimeSlots(date: Date): Promise<Array<{ start: string; end: string; startDateTime: Date; duration: string; durationMinutes: number }>> {
    const allAvailableSlots: Array<{ start: string; end: string; startDateTime: Date; duration: string; durationMinutes: number }> = [];
    
    // Define all possible durations
    const durations = ["1h", "1h30", "2h"];
    
    // For each duration, get available slots and add duration info
    for (const duration of durations) {
      const slotsForDuration = await this.getAvailableTimeSlots(date, duration);
      
      // Transform each slot to include duration information
      for (const slot of slotsForDuration) {
        allAvailableSlots.push({
          ...slot,
          duration,
          durationMinutes: durationToMinutes(duration),
        });
      }
    }
    
    // Sort by start time
    allAvailableSlots.sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
    
    return allAvailableSlots;
  }
}

export const storage = new DatabaseStorage();
