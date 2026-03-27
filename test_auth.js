// Test authentication API
const API_URL = 'http://localhost:5000/api';

// Test data
const testCustomer = {
  name: 'Test Customer',
  email: 'test@example.com',
  password: '123456',
  phone: '0900000000',
  address: 'Test Address'
};

// Test functions
async function testCreateCustomer() {
  console.log('🧪 Testing create customer...');
  try {
    const response = await fetch(`${API_URL}/auth/create-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCustomer)
    });
    
    const result = await response.json();
    console.log('✅ Create Customer Response:', result);
    
    if (result.success) {
      console.log('✅ Customer created successfully');
      await testLogin();
    } else {
      console.log('❌ Create Customer failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Create Customer Error:', error);
  }
}

async function testLogin() {
  console.log('\n🧪 Testing login...');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testCustomer.email,
        password: testCustomer.password
      })
    });
    
    const result = await response.json();
    console.log('✅ Login Response:', result);
    
    if (result.success) {
      console.log('✅ Login successful!');
      console.log('👤 User:', result.user);
      console.log('🔑 Role:', result.role);
    } else {
      console.log('❌ Login failed:', result.message);
      
      // Test with wrong password
      console.log('\n🧪 Testing login with wrong password...');
      const wrongResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testCustomer.email,
          password: 'wrongpassword'
        })
      });
      
      const wrongResult = await wrongResponse.json();
      console.log('✅ Wrong Password Response:', wrongResult);
    }
  } catch (error) {
    console.error('❌ Login Error:', error);
  }
}

async function testCheckEmail() {
  console.log('\n🧪 Testing check email...');
  try {
    const response = await fetch(`${API_URL}/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testCustomer.email
      })
    });
    
    const result = await response.json();
    console.log('✅ Check Email Response:', result);
  } catch (error) {
    console.error('❌ Check Email Error:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  // Test check email first
  await testCheckEmail();
  
  // Create customer
  await testCreateCustomer();
  
  // Test check email again
  await testCheckEmail();
  
  console.log('\n✅ Tests completed!');
}

// Wait a bit for server to start
setTimeout(runTests, 3000);
