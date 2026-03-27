# 🔧 Complete Authentication Fix Guide

## 🐛 Current Issues Identified:

1. **Customer ID Error**: `id: Path 'id' is required.` ✅ FIXED
2. **Backend Server**: May not be running properly
3. **Database Connection**: MongoDB connection issues
4. **Password Comparison**: Plaintext vs Hash mismatch

## 🛠️ Step-by-Step Fix:

### Step 1: Start Backend Server
```bash
cd c:\huyproject\unishop
npm run server
```

**Expected Output:**
```
⏳ Đang kết nối MongoDB: mongodb://localhost:27017/unishop
 MongoDB Connected: localhost
🚀 Server running on http://localhost:5000
```

### Step 2: Test Database Connection
```bash
cd c:\huyproject\unishop\server
node debug_full.js
```

**Expected Output:**
```
✅ Connected to MongoDB
🧹 Cleared all customers
✅ Manual customer created: manual@test.com
✅ Customer found: manual@test.com
✅ Login simulation SUCCESS
```

### Step 3: Test API Endpoints
```bash
cd c:\huyproject\unishop
node test_api_direct.js
```

**Expected Output:**
```
✅ Check-email response: { exists: false }
✅ Send-code response: { success: true }
✅ Create-customer response: { success: true }
✅ Login response: { success: true, user: {...} }
```

### Step 4: Test Frontend Flow
1. **Register**: http://localhost:5173/register
   - Email: `test@example.com`
   - Password: `123456`
   - Phone: `0900000000`

2. **Check Email**: Look for verification code in console
   - Backend will log: `📧 Verification code sent to test@example.com`
   - Code format: 6 digits (e.g., `123456`)

3. **Verify**: Enter code on verification page
   - Should show: "Tài khoản đã được tạo thành công!"

4. **Login**: http://localhost:5173/login
   - Use same email/password
   - Should redirect to `/store`

## 🔍 Debug Commands:

### Check Server Status:
```bash
curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

### Check MongoDB:
```bash
# Connect to MongoDB
mongosh
use unishop
db.customers.find().pretty()
```

### Reset Database:
```bash
cd c:\huyproject\unishop\server
node -e "
import mongoose from 'mongoose';
import { Customer } from './models.js';
await mongoose.connect('mongodb://localhost:27017/unishop');
await Customer.deleteMany({});
console.log('Database cleared');
"
```

## 🚀 Common Solutions:

### Issue: Server not starting
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB service (Windows)
net start MongoDB
```

### Issue: Port 5000 in use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Issue: Email verification not working
- Check Gmail App Password in `.env`
- Ensure 2FA is enabled on Gmail account
- Check console for email sending logs

## ✅ Success Indicators:

1. **Server**: `🚀 Server running on http://localhost:5000`
2. **Database**: `MongoDB Connected: localhost`
3. **Registration**: Email verification code sent
4. **Creation**: Customer created in database
5. **Login**: Redirect to `/store`

## 📞 If Still Not Working:

1. **Check logs**: Look at server console for errors
2. **Verify MongoDB**: Ensure MongoDB service is running
3. **Test manually**: Use Postman/Insomnia to test API
4. **Reset everything**: Clear database and restart

## 🎯 Quick Test Script:
```javascript
// Test in browser console
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: '123456' })
})
.then(res => res.json())
.then(data => console.log('Login test:', data))
```
