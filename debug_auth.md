# 🔍 Debug Authentication Issue

## 📋 Vấn đề
Đăng ký thành công nhưng đăng nhập không được.

## 🧪 Nguyên nhân có thể

### 1. **Backend Server chưa chạy**
```bash
# Start server
npm run server
```

### 2. **MongoDB chưa kết nối**
```bash
# Check MongoDB connection
# File: server/.env
MONGODB_URI=mongodb://localhost:27017/unishop
```

### 3. **Password comparison issue**
Backend đang so sánh plaintext:
```javascript
// server/controllers/authController.js
if (customer && customer.password === password) {
  // Login success
}
```

### 4. **Database không có customer**
Đăng ký thành công nhưng có thể lưu sai database.

## 🔧 Steps to Debug

### Step 1: Start Backend Server
```bash
cd c:\huyproject\unishop
npm run server
```

### Step 2: Test Registration
1. Mở frontend: http://localhost:5173/login
2. Click "Đăng ký"
3. Điền thông tin:
   - Email: test@example.com
   - Password: 123456
   - Phone: 0900000000
4. Verify email → Tạo tài khoản

### Step 3: Test Login
1. Quay lại trang login: http://localhost:5173/login
2. Đùng email/password vừa đăng ký
3. Kiểm tra kết quả

### Step 4: Check Database
```bash
# Run test script
cd c:\huyproject\unishop\server
node test_customer.js
```

## 🐛 Common Issues

### Issue 1: Server not responding
- **Solution**: Start server with `npm run server`
- **Check**: Port 5000 must be available

### Issue 2: MongoDB connection failed
- **Solution**: Start MongoDB service
- **Check**: MongoDB running on localhost:27017

### Issue 3: Password mismatch
- **Cause**: Backend expects plaintext password
- **Solution**: Ensure frontend sends exact password

### Issue 4: Wrong database
- **Cause**: Multiple MongoDB instances
- **Solution**: Check MONGODB_URI in .env

## 📝 Expected Flow

1. **Register**: `/register` → `/verify` → Create customer in MongoDB
2. **Login**: `/login` → Check email/password in MongoDB
3. **Success**: Redirect to `/store`

## 🚀 Quick Test

```javascript
// Test API directly
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: '123456'
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

## 📞 Next Steps

1. Start backend server
2. Test registration flow
3. Test login with same credentials
4. Check database if needed
5. Verify password comparison logic
