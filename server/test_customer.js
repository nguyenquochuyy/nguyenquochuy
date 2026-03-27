import mongoose from 'mongoose';
import { Customer } from './models.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unishop';

const testCustomer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test customer data
    const testEmail = 'customer@test.com';
    const testPassword = '123456';

    // Check if customer exists
    const existing = await Customer.findOne({ email: testEmail });
    
    if (existing) {
      console.log(`✅ Customer ${testEmail} already exists`);
      console.log(`   Password in DB: "${existing.password}"`);
      console.log(`   Status: ${existing.status}`);
      
      // Test login
      if (existing.password === testPassword) {
        console.log('✅ Password match - Login should work!');
      } else {
        console.log('❌ Password mismatch - Login will fail!');
        console.log(`   Expected: "${testPassword}"`);
        console.log(`   Actual: "${existing.password}"`);
      }
    } else {
      console.log(`❌ Customer ${testEmail} not found in database`);
      console.log('Creating test customer...');
      
      await Customer.create({
        id: `cust_${Date.now()}`,
        name: 'Test Customer',
        email: testEmail,
        password: testPassword, // Plaintext for testing
        phone: '0900000002',
        address: 'Test Address',
        loyaltyPoints: 0,
        wishlist: [],
        joinedAt: new Date().toISOString(),
        status: 'ACTIVE'
      });
      
      console.log(`✅ Created test customer: ${testEmail} / ${testPassword}`);
    }

    // Show all customers
    const allCustomers = await Customer.find({});
    console.log(`\n📊 Total customers in database: ${allCustomers.length}`);
    allCustomers.forEach(customer => {
      console.log(`   - ${customer.email} (${customer.status})`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testCustomer();
