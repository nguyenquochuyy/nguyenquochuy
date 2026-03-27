console.log('🧪 Simple Authentication Test');

// Test if we can import models
try {
  const { Customer } = await import('./server/models.js');
  console.log('✅ Models imported successfully');
} catch (error) {
  console.log('❌ Model import failed:', error.message);
}

// Test basic connection
try {
  const mongoose = await import('mongoose');
  console.log('✅ Mongoose imported');
} catch (error) {
  console.log('❌ Mongoose import failed:', error.message);
}

console.log('🎯 Test completed!');
