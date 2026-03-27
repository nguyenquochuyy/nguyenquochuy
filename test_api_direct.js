// Test API directly without server
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Authentication API...\n');

  // Test 1: Check email
  console.log('1️⃣ Testing check-email...');
  try {
    const response = await fetch(`${API_URL}/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    const result = await response.json();
    console.log('✅ Check-email response:', result);
  } catch (error) {
    console.log('❌ Check-email error:', error.message);
  }

  // Test 2: Send verification code
  console.log('\n2️⃣ Testing send-code...');
  try {
    const response = await fetch(`${API_URL}/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    const result = await response.json();
    console.log('✅ Send-code response:', result);
  } catch (error) {
    console.log('❌ Send-code error:', error.message);
  }

  // Test 3: Verify code (mock)
  console.log('\n3️⃣ Testing verify-code...');
  try {
    const response = await fetch(`${API_URL}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com',
        code: '123456' // Mock code
      })
    });
    const result = await response.json();
    console.log('✅ Verify-code response:', result);
  } catch (error) {
    console.log('❌ Verify-code error:', error.message);
  }

  // Test 4: Create customer
  console.log('\n4️⃣ Testing create-customer...');
  try {
    const response = await fetch(`${API_URL}/auth/create-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '0900000000',
        password: '123456',
        address: 'Test Address'
      })
    });
    const result = await response.json();
    console.log('✅ Create-customer response:', result);
  } catch (error) {
    console.log('❌ Create-customer error:', error.message);
  }

  // Test 5: Login
  console.log('\n5️⃣ Testing login...');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456'
      })
    });
    const result = await response.json();
    console.log('✅ Login response:', result);
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }

  console.log('\n🎯 Test completed!');
}

// Wait for server to be ready
setTimeout(testAPI, 2000);
