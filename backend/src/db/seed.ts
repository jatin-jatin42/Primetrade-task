import { db } from './db';
import { users } from './schema';
import { hashPassword } from '../utils/hash';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

async function seed() {
  console.log('Seeding admin user...');
  try {
    const adminPassword = await hashPassword('admin123');
    
    // Check if admin already exists
    const existingAdmins = await db.select().from(users).where(eq(users.email, 'admin@primetrade.ai'));

    if (existingAdmins.length === 0) {
      await db.insert(users).values({
        name: 'Admin User',
        email: 'admin@primetrade.ai',
        password: adminPassword,
        role: 'admin',
      });
      console.log('Admin user seeded successfully: admin@primetrade.ai / admin123');
    } else {
      console.log('Admin user already exists!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seed();
