import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("user"), // "user" or "admin"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions table for managing user sessions
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // Link to user account
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  gradeLevel: text("grade_level").notNull(),
  subject: text("subject").notNull(), // "math" or "science"
  duration: text("duration").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  price: integer("price").notNull(),
  startTime: timestamp("start_time").notNull(), // Actual class start time
  endTime: timestamp("end_time").notNull(), // Actual class end time
  status: text("status").default("confirmed").notNull(), // "confirmed", "cancelled", "completed"
  notes: text("notes"), // Admin notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Time slots are no longer needed - we'll calculate availability dynamically
export const timeSlots = pgTable("time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dateTime: timestamp("date_time").notNull(),
  isBooked: integer("is_booked").default(0).notNull(),
  duration: text("duration").notNull().default("1h"), // "1h", "1h30", "2h"
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }), // Admin who created the slot
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema validations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email("L'adresse courriel est invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  role: z.enum(["user", "admin"]).default("user"),
});

export const loginSchema = z.object({
  email: z.string().email("L'adresse courriel est invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  startTime: true,
  endTime: true,
}).extend({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  email: z.string().email("L'adresse courriel est invalide"),
  gradeLevel: z.enum([
    "primaire-1", "primaire-2", "primaire-3", "primaire-4", "primaire-5", "primaire-6",
    "secondaire-1", "secondaire-2", "secondaire-3", "secondaire-4", "secondaire-5"
  ]),
  subject: z.enum(["math", "science"], { required_error: "La matière est requise" }),
  duration: z.enum(["1h", "1h30", "2h"], { required_error: "La durée est requise" }),
  location: z.enum(["teacher", "home", "online"], { required_error: "Le lieu est requis" }),
  address: z.string().optional(),
  price: z.number().min(0), // Changed from positive() to min(0) to allow 0
  requestedStartTime: z.date(), // The time the user wants to book
  status: z.enum(["confirmed", "cancelled", "completed"]).default("confirmed"),
  notes: z.string().optional(),
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
  createdAt: true,
}).extend({
  dateTime: z.date(),
  duration: z.enum(["1h", "1h30", "2h"]).default("1h"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
