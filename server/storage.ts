import { type Booking, type InsertBooking, type TimeSlot, type InsertTimeSlot } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  
  getAvailableTimeSlots(): Promise<TimeSlot[]>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  markTimeSlotAsBooked(dateTime: Date): Promise<void>;
  initializeTimeSlots(): Promise<void>;
}

export class MemStorage implements IStorage {
  private bookings: Map<string, Booking>;
  private timeSlots: Map<string, TimeSlot>;

  constructor() {
    this.bookings = new Map();
    this.timeSlots = new Map();
    this.initializeTimeSlots();
  }

  async initializeTimeSlots(): Promise<void> {
    const now = new Date();
    const slots: Date[] = [];

    for (let day = 1; day <= 30; day++) {
      const date = new Date(now);
      date.setDate(now.getDate() + day);
      
      [9, 10, 11, 13, 14, 15, 16, 17, 18, 19].forEach((hour) => {
        const slotDate = new Date(date);
        slotDate.setHours(hour, 0, 0, 0);
        slots.push(slotDate);
      });
    }

    for (const slotDate of slots) {
      const id = randomUUID();
      const timeSlot: TimeSlot = {
        id,
        dateTime: slotDate,
        isBooked: 0,
      };
      this.timeSlots.set(id, timeSlot);
    }
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      address: insertBooking.address ?? null,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    
    await this.markTimeSlotAsBooked(insertBooking.dateTime);
    
    return booking;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getAvailableTimeSlots(): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values()).filter((slot) => slot.isBooked === 0);
  }

  async createTimeSlot(insertTimeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const id = randomUUID();
    const timeSlot: TimeSlot = {
      ...insertTimeSlot,
      id,
      isBooked: insertTimeSlot.isBooked ?? 0,
    };
    this.timeSlots.set(id, timeSlot);
    return timeSlot;
  }

  async markTimeSlotAsBooked(dateTime: Date): Promise<void> {
    const slot = Array.from(this.timeSlots.values()).find(
      (s) => s.dateTime.getTime() === dateTime.getTime()
    );
    
    if (slot) {
      slot.isBooked = 1;
      this.timeSlots.set(slot.id, slot);
    }
  }
}

export const storage = new MemStorage();
