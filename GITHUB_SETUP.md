# 🐙 ĐƯA DỰ ÁN LÊN GITHUB - HƯỚNG DẪN CHI TIẾT

## 📋 **ĐÃ HOÀN TẤT LOCAL GIT**
- ✅ Git initialized
- ✅ .gitignore configured
- ✅ README.md updated
- ✅ All files committed

## 🚀 **CÁC BƯỚC ĐƯA LÊN GITHUB**

### **Step 1: Tạo Repository trên GitHub**

1. **Truy cập GitHub**: https://github.com
2. **Đăng nhập** hoặc tạo account
3. **Click "New repository"** (màu xanh)
4. **Đặt tên repository**: `unishop`
5. **Description**: `Modern E-Commerce Platform with React, Node.js, MongoDB`
6. **Visibility**: Public (miễn phí)
7. **❌ KHÔNG check** "Add a README file" (đã có rồi)
8. **❌ KHÔNG check** "Add .gitignore" (đã có rồi)
9. **❌ KHÔNG check** "Choose a license" (có thể thêm sau)
10. **Click "Create repository"**

### **Step 2: Push Code Lên GitHub**

**Copy commands từ GitHub repository mới tạo:**

```bash
# Thay YOUR_USERNAME bằng username GitHub của bạn
git remote add origin https://github.com/YOUR_USERNAME/unishop.git
git branch -M main
git push -u origin main
```

### **Step 3: Kiểm Tra Repository**

1. **Truy cập**: https://github.com/YOUR_USERNAME/unishop
2. **Kiểm tra files**: Tất cả code đã có trên GitHub
3. **Readme**: Hiển thị đẹp mắt
4. **Commits**: Có 1 commit với message chi tiết

---

## 🔧 **DEPLOY TỪ GITHUB LÊN VERCEL**

### **Step 1: Kết nối Vercel với GitHub**

1. **Truy cập**: https://vercel.com
2. **Đăng nhập bằng GitHub**
3. **Click "New Project"**
4. **Import repository**: `unishop`
5. **Click "Import"**

### **Step 2: Cấu hình Vercel**

**Framework Preset:**
- Framework: `Vite`
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
```
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/unishop
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
NODE_ENV = production
```

### **Step 3: Deploy**

1. **Click "Deploy"**
2. **Chờ vài phút** để build và deploy
3. **Kết quả**: `https://unishop.vercel.app`

---

## 📱 **TEST SAU KHI DEPLOY**

### **Kiểm tra Website:**
1. **Truy cập**: `https://unishop.vercel.app`
2. **Test đăng ký**: Tạo tài khoản mới
3. **Test email**: Kiểm tra verification code
4. **Test login**: Đăng nhập với tài khoản mới
5. **Test UI**: Responsive trên mobile/desktop

### **Kiểm tra API:**
```bash
# Test health endpoint
curl https://unishop.vercel.app/api/health

# Test login endpoint
curl -X POST https://unishop.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

---

## 🎯 **CÁC LỖI THƯỜNG GẶP**

### **❌ "Permission denied"**
```bash
# Fix: Cấu hình SSH key hoặc dùng Personal Access Token
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/unishop.git
```

### **❌ "Build failed"**
```bash
# Fix: Kiểm tra package.json và vercel.json
npm run build  # Local test
```

### **❌ "Database connection failed"**
```bash
# Fix: Kiểm tra environment variables
# MongoDB Atlas: IP whitelist (0.0.0.0/0)
```

### **❌ "Email not sending"**
```bash
# Fix: Kiểm tra Gmail App Password
# Bật 2FA → Tạo App Password
```

---

## 🔄 **AUTO-DEPLOY SETUP**

### **Mỗi khi push code:**
1. **Commit changes**: `git commit -m "Update feature"`
2. **Push to GitHub**: `git push origin main`
3. **Vercel auto-deploy**: Tự động build và deploy
4. **Website updated**: Mới nhất trong vài phút

### **Branches:**
- **main**: Production (auto-deploy)
- **develop**: Development (manual deploy)
- **feature/***: Feature branches (no deploy)

---

## 📊 **MONITORING**

### **Vercel Dashboard:**
- **Analytics**: Page views, visitors
- **Speed**: Performance metrics
- **Errors**: Build logs, runtime errors
- **Usage**: Bandwidth, function invocations

### **MongoDB Atlas:**
- **Metrics**: Database performance
- **Logs**: Query logs
- **Storage**: Usage statistics

---

## 🎉 **SUCCESS INDICATORS**

### **✅ Deploy Thành Công:**
- Website live tại `https://unishop.vercel.app`
- API endpoints working
- Database connected
- Email service working
- No build errors

### **✅ Features Working:**
- User registration
- Email verification
- Login/logout
- Shopping cart
- Admin panel

---

## 📞 **NEXT STEPS**

### **Ngay sau khi deploy:**
1. **Test toàn bộ functionality**
2. **Setup custom domain** (tùy chọn)
3. **Add monitoring**
4. **Share với team**

### **Long-term:**
1. **Add comprehensive testing**
2. **Implement CI/CD**
3. **Add analytics**
4. **Scale infrastructure**

---

## 🚀 **QUICK COMMANDS**

```bash
# Push update
git add .
git commit -m "Update feature"
git push origin main

# Check deploy status
vercel logs

# Check environment variables
vercel env ls
```

**🎯 Chúc bạn deploy thành công! Website sẽ live trong vài phút!** 🚀✨
