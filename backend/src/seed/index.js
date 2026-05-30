import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Plan } from '../models/Plan.js';
import { User } from '../models/User.js';
import { plansSeedData } from './plans.seed.js';
import { ROLES } from '../constants/index.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/subscription_dashboard');
    console.log('Connected to MongoDB for seeding...');

    await Plan.deleteMany({});
    const plans = await Plan.insertMany(plansSeedData);
    console.log(`Seeded ${plans.length} plans`);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dashboard.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123456',
        role: ROLES.ADMIN,
      });
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
