import 'dotenv/config';
import { db } from './storage';
import { users } from '../shared/schema';
import { AuthService } from './auth';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  try {
    const adminData = {
      email: 'admin@tutoratreussite.com',
      password: 'AdminPassword123!',
      firstName: 'Admin',
      lastName: 'TutoratRéussite',
      role: 'admin' as const,
      phone: '(514) 555-0123',
    };

    // Check if admin already exists
    const [existingAdmin] = await db.select().from(users).where(eq(users.email, adminData.email)).limit(1);
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists. Updating password...');
      
      // Update the existing admin's password
      const hashedPassword = await AuthService.hashPassword(adminData.password);
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, adminData.email));
      
      console.log('✅ Admin password updated successfully!');
    } else {
      // Hash the password
      const hashedPassword = await AuthService.hashPassword(adminData.password);

      // Create admin user
      await db.insert(users).values({
        ...adminData,
        password: hashedPassword,
      }).returning();

      console.log('✅ Admin user created successfully!');
    }
    
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Name:', `${adminData.firstName} ${adminData.lastName}`);
    console.log('🛡️ Role:', adminData.role);
    console.log('\nYou can now log in with these credentials at /login');
    
  } catch (error: any) {
    console.error('❌ Error managing admin user:', error);
  }
}

// Run the script
createAdminUser().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});