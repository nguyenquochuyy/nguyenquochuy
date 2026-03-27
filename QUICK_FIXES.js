// 🚨 QUICK FIXES FOR CRITICAL ISSUES
// Run these fixes immediately

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Customer, Employee } from './server/models.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unishop';

// Fix 1: Hash all existing plaintext passwords
const fixPasswordSecurity = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔒 Fixing password security...');

    // Hash all customer passwords
    const customers = await Customer.find({});
    for (const customer of customers) {
      if (customer.password && !customer.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(customer.password, 10);
        await Customer.findByIdAndUpdate(customer._id, { password: hashedPassword });
        console.log(`✅ Hashed password for: ${customer.email}`);
      }
    }

    // Hash all employee passwords
    const employees = await Employee.find({});
    for (const employee of employees) {
      if (employee.password && !employee.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(employee.password, 10);
        await Employee.findByIdAndUpdate(employee._id, { password: hashedPassword });
        console.log(`✅ Hashed password for: ${employee.email}`);
      }
    }

    console.log('🔒 Password security fixed!');
  } catch (error) {
    console.error('❌ Password fix error:', error);
  }
};

// Fix 2: Create test users with proper setup
const createTestUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('👥 Creating test users...');

    // Clear existing test users
    await Customer.deleteMany({ email: { $regex: /test|example/ } });
    await Employee.deleteMany({ email: { $regex: /test|admin/ } });

    // Create test customer with hashed password
    const customerPassword = await bcrypt.hash('123456', 10);
    const testCustomer = new Customer({
      id: `cust_${Date.now()}_test`,
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '0900000000',
      password: customerPassword,
      address: 'Test Address',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      loyaltyPoints: 0,
      wishlist: []
    });
    await testCustomer.save();
    console.log('✅ Test customer created: test@example.com / 123456');

    // Create test admin with hashed password
    const adminPassword = await bcrypt.hash('123', 10);
    const testAdmin = new Employee({
      id: `emp_${Date.now()}_admin`,
      name: 'Test Admin',
      email: 'admin@unishop.com',
      password: adminPassword,
      phone: '0900000001',
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });
    await testAdmin.save();
    console.log('✅ Test admin created: admin@unishop.com / 123');

    console.log('👥 Test users ready!');
  } catch (error) {
    console.error('❌ Test users error:', error);
  }
};

// Fix 3: Verify database connection
const verifyDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔍 Verifying database...');
    
    const customerCount = await Customer.countDocuments();
    const employeeCount = await Employee.countDocuments();
    
    console.log(`📊 Database stats:`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   Employees: ${employeeCount}`);
    console.log(`   Connection: ✅ OK`);
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
  }
};

// Run all fixes
const runQuickFixes = async () => {
  console.log('🚀 RUNNING QUICK FIXES...\n');
  
  await verifyDatabase();
  await createTestUsers();
  await fixPasswordSecurity();
  
  console.log('\n✅ ALL FIXES COMPLETED!');
  console.log('\n📋 Test Credentials:');
  console.log('   Customer: test@example.com / 123456');
  console.log('   Admin: admin@unishop.com / 123');
  console.log('\n🎯 Next: Start server and test!');
  
  await mongoose.disconnect();
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

runQuickFixes();
