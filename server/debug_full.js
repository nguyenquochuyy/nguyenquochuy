import mongoose from 'mongoose';
import { Customer, Employee } from './models.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unishop';

const debugFull = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all customers for clean test
    await Customer.deleteMany({});
    console.log('🧹 Cleared all customers');

    // Test 1: Create customer manually
    console.log('\n🧪 Test 1: Create customer manually...');
    try {
      const testCustomer = new Customer({
        id: `cust_${Date.now()}_manual`,
        name: 'Manual Test',
        email: 'manual@test.com',
        phone: '0900000001',
        password: '123456',
        address: 'Test Address',
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
        loyaltyPoints: 0,
        wishlist: []
      });
      
      await testCustomer.save();
      console.log('✅ Manual customer created:', testCustomer.email);
    } catch (error) {
      console.error('❌ Manual create error:', error.message);
    }

    // Test 2: Find customer
    console.log('\n🧪 Test 2: Find customer...');
    const found = await Customer.findOne({ email: 'manual@test.com' });
    if (found) {
      console.log('✅ Customer found:', found.email);
      console.log('   Password:', found.password);
    } else {
      console.log('❌ Customer not found');
    }

    // Test 3: Login simulation
    console.log('\n🧪 Test 3: Login simulation...');
    const loginEmail = 'manual@test.com';
    const loginPassword = '123456';
    
    const customer = await Customer.findOne({ email: loginEmail });
    if (customer && customer.password === loginPassword) {
      console.log('✅ Login simulation SUCCESS');
    } else {
      console.log('❌ Login simulation FAILED');
      console.log('   Email:', loginEmail);
      console.log('   Expected Password:', loginPassword);
      console.log('   Actual Password:', customer?.password || 'NOT FOUND');
    }

    // Test 4: Check all customers
    console.log('\n🧪 Test 4: All customers in DB...');
    const allCustomers = await Customer.find({});
    console.log(`📊 Total customers: ${allCustomers.length}`);
    allCustomers.forEach(c => {
      console.log(`   - ${c.email} (${c.id})`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Debug error:', error);
    process.exit(1);
  }
};

debugFull();
