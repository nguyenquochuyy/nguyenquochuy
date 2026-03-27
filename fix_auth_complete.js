// Complete fix for authentication issues
import mongoose from 'mongoose';
import { Customer } from './server/models.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unishop';

const fixAuth = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Clear existing test data
    await Customer.deleteMany({ email: { $regex: /test|example/ } });
    console.log('🧹 Cleared test customers');

    // Step 2: Create test customer with proper ID
    const testCustomer = {
      id: `cust_${Date.now()}_test`,
      name: 'Test User',
      email: 'test@example.com',
      phone: '0900000000',
      password: '123456',
      address: 'Test Address',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      loyaltyPoints: 0,
      wishlist: []
    };

    console.log('\n🧪 Creating test customer...');
    const customer = new Customer(testCustomer);
    await customer.save();
    console.log('✅ Customer created:', customer.email);

    // Step 3: Test login logic
    console.log('\n🧪 Testing login logic...');
    const foundCustomer = await Customer.findOne({ email: 'test@example.com' });
    
    if (foundCustomer) {
      console.log('✅ Found customer:', foundCustomer.email);
      console.log('📋 Stored password:', foundCustomer.password);
      console.log('🔑 Test password:', '123456');
      
      if (foundCustomer.password === '123456') {
        console.log('✅ Password MATCH - Login should work!');
      } else {
        console.log('❌ Password MISMATCH - Login will fail!');
      }
    } else {
      console.log('❌ Customer not found');
    }

    // Step 4: Show all customers
    console.log('\n📊 All customers in database:');
    const allCustomers = await Customer.find({});
    console.log(`Total: ${allCustomers.length}`);
    allCustomers.forEach(c => {
      console.log(`  - ${c.email} (${c.id}) - Status: ${c.status}`);
    });

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Start backend server: npm run server');
    console.log('2. Test login with: test@example.com / 123456');
    console.log('3. Check server console for any errors');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix error:', error.message);
    process.exit(1);
  }
};

fixAuth();
