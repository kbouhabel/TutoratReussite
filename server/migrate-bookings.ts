import 'dotenv/config';
import { db } from './storage';
import { bookings } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function migrateBookings() {
  console.log('🔄 Starting booking migration...');
  
  try {
    // First, add the new columns as nullable
    console.log('Adding new columns...');
    await db.execute(sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS start_time timestamp,
      ADD COLUMN IF NOT EXISTS end_time timestamp,
      ADD COLUMN IF NOT EXISTS buffer_start_time timestamp,
      ADD COLUMN IF NOT EXISTS buffer_end_time timestamp;
    `);
    
    // Get all existing bookings
    console.log('Fetching existing bookings...');
    const existingBookings = await db.execute(sql`
      SELECT id, date_time, duration FROM bookings WHERE date_time IS NOT NULL;
    `);
    
    console.log(`Found ${existingBookings.rows.length} bookings to migrate`);
    
    // Update each booking with calculated times
    for (const booking of existingBookings.rows) {
      const dateTime = new Date(booking.date_time as string);
      const duration = booking.duration as string;
      
      // Calculate duration in minutes
      const durationMinutes = duration === "1h" ? 60 : duration === "1h30" ? 90 : 120;
      
      // Calculate buffer start (30 min before)
      const bufferStart = new Date(dateTime);
      bufferStart.setMinutes(bufferStart.getMinutes() - 30);
      
      // Calculate class end
      const classEnd = new Date(dateTime);
      classEnd.setMinutes(classEnd.getMinutes() + durationMinutes);
      
      // Calculate buffer end (30 min after)
      const bufferEnd = new Date(classEnd);
      bufferEnd.setMinutes(bufferEnd.getMinutes() + 30);
      
      // Update the booking
      await db.execute(sql`
        UPDATE bookings 
        SET 
          start_time = ${dateTime.toISOString()},
          end_time = ${classEnd.toISOString()},
          buffer_start_time = ${bufferStart.toISOString()},
          buffer_end_time = ${bufferEnd.toISOString()}
        WHERE id = ${booking.id};
      `);
      
      console.log(`✅ Migrated booking ${booking.id}`);
    }
    
    // Now make the columns NOT NULL
    console.log('Making columns NOT NULL...');
    await db.execute(sql`
      ALTER TABLE bookings 
      ALTER COLUMN start_time SET NOT NULL,
      ALTER COLUMN end_time SET NOT NULL,
      ALTER COLUMN buffer_start_time SET NOT NULL,
      ALTER COLUMN buffer_end_time SET NOT NULL;
    `);
    
    // Finally, drop the old date_time column
    console.log('Dropping old date_time column...');
    await db.execute(sql`
      ALTER TABLE bookings DROP COLUMN IF EXISTS date_time;
    `);
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrateBookings().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
