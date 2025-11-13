import 'dotenv/config';
import { db } from './storage';
import { timeSlots } from '../shared/schema';

async function resetTimeSlots() {
  try {
    console.log('🗑️  Deleting old time slots...');
    await db.delete(timeSlots);
    
    console.log('✅ Time slots deleted successfully!');
    console.log('ℹ️  New time slots will be created automatically when you restart the server.');
    console.log('📅 New schedule: Starting at 9:30 AM with 30-minute intervals');
    console.log('⏰ Time slots: 9:30, 10:00, 10:30, 11:00, 11:30, then 13:00-19:30');
    
  } catch (error: any) {
    console.error('❌ Error resetting time slots:', error);
  }
}

resetTimeSlots().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
