import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StaffUser } from '../models/StaffUser.js';

dotenv.config();

const seedAdminUser = async () => {
  const mongoURI = process.env.MONGO_URI || '';

  try {
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB for seeding');

    const adminEmail = 'admin@company.com';
    const existing = await StaffUser.findOne({ email: adminEmail });

    if (existing) {
      console.log(`[Seed] Staff user already exists: ${adminEmail}`);
    } else {
      await StaffUser.create({
        email: adminEmail,
        password: 'admin123456',
        fullName: 'Admin User',
        role: 'admin'
      });
      console.log(`[Seed] Successfully seeded admin user: ${adminEmail} (password: admin123456)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedAdminUser();

