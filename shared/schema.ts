import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  gradeLevel: text("grade_level").notNull(),
  duration: text("duration").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  price: integer("price").notNull(),
  dateTime: timestamp("date_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeSlots = pgTable("time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dateTime: timestamp("date_time").notNull(),
  isBooked: integer("is_booked").default(0).notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  email: z.string().email("L'adresse courriel est invalide"),
  gradeLevel: z.enum([
    "primaire-1", "primaire-2", "primaire-3", "primaire-4", "primaire-5", "primaire-6",
    "secondaire-1", "secondaire-2", "secondaire-3", "secondaire-4", "secondaire-5"
  ]),
  duration: z.enum(["1h", "1h30", "2h"]),
  location: z.enum(["teacher", "home"]),
  address: z.string().optional(),
  price: z.number().positive(),
  dateTime: z.date(),
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
