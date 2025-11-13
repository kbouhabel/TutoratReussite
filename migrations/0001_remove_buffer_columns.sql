-- Migration to remove buffer_start_time and buffer_end_time columns from bookings table
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "buffer_start_time";
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "buffer_end_time";
