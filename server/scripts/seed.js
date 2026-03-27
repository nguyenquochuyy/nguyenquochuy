import { Employee, SystemSetting } from '../models.js';
import connectDB from '../config/db.js';
import mongoose from 'mongoose';

const DEFAULT_SETTINGS = {
  shopInfo: { name: 'UniShop', phone: '0901234567', address: '123 Le Loi, D1, HCMC', email: 'contact@unishop.com' },
  paymentMethods: { cod: true, banking: true, momo: false },
  shipping: { standardFee: 30000, freeShipThreshold: 500000 },
  inventory: { lowStockThreshold: 10, showOutOfStock: true },
  orders: { autoConfirm: false, invoicePrefix: 'INV-' },
  tax: { defaultRate: 10 },
  security: { enable2FA: false, passwordExpiry: 90 },
  notifications: { emailOnOrder: true, pushLowStock: false },
  staff: { allowDelete: false, maxDiscount: 20 }
};

export const seedDatabase = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminExists = await Employee.findOne({ email: adminEmail });
    
    if (!adminExists) {
      await Employee.create({
          id: 'emp_admin_custom',
          name: 'Super Admin',
          email: adminEmail,
          password: '123456',
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date().toISOString(),
          level2Password: '123456',
          phone: '0900000000'
      });
      console.log(`✅ Admin account created: ${adminEmail} / 123456`);
    }
    
    // Seed Settings if not exist
    const settingsExist = await SystemSetting.findOne({ key: 'globalSettings' });
    if (!settingsExist) {
        await SystemSetting.create({ key: 'globalSettings', value: DEFAULT_SETTINGS });
        console.log('✅ Default settings initialized');
    }
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

// Nếu file được gọi trực tiếp qua terminal (node seed.js)
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
    connectDB().then(async () => {
        await seedDatabase();
        console.log("✅ Seed database success.");
        process.exit(0);
    });
}
