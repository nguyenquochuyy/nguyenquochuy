
import mongoose from 'mongoose';
import { Employee } from './models.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unishop';

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin_new@gmail.com';
    const existing = await Employee.findOne({ email: adminEmail });

    if (existing) {
      console.log(`Admin ${adminEmail} already exists`);
    } else {
      await Employee.create({
        id: `emp_${Date.now()}`,
        name: 'Antigravity Admin',
        email: adminEmail,
        password: '123',
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
        level2Password: '123456',
        phone: '0900000001'
      });
      console.log(`Admin account created: ${adminEmail} / 123`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
