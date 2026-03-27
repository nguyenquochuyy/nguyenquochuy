# 🚀 DEPLOY DỰ ÁN UNISHOP MIỄN PHÍ

## 📋 **CÁC LỰA CHỌN DEPLOY MIỄN PHÍ**

### **🏆 RECOMMENDED: Vercel + MongoDB Atlas**
- **Frontend**: Vercel (Free, auto-deploy)
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB Atlas (Free 512MB)
- **Email**: Gmail SMTP (Free)

### **🥈 ALTERNATIVE: Netlify + Render**
- **Frontend**: Netlify (Free)
- **Backend**: Render (Free tier)
- **Database**: MongoDB Atlas (Free)

---

## 🎯 **OPTION 1: DEPLOY TRÊN VERCEL (RECOMMENDED)**

### **Step 1: Chuẩn bị Database**
```bash
# 1. Tạo account MongoDB Atlas
# https://www.mongodb.com/atlas

# 2. Create cluster (Free tier - M0 Sandbox)
# 3. Create database user
# 4. Get connection string
```

### **Step 2: Cập nhật Environment Variables**
```bash
# Tạo file .env.production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unishop?retryWrites=true&w=majority
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### **Step 3: Cấu hình Vercel**
```bash
# 1. Tạo account Vercel
# https://vercel.com

# 2. Install Vercel CLI
npm i -g vercel

# 3. Login
vercel login
```

### **Step 4: Tạo vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "EMAIL_USER": "@email_user",
    "EMAIL_PASS": "@email_pass"
  }
}
```

### **Step 5: Cập nhật package.json**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server/server.js",
    "vercel-build": "vite build"
  }
}
```

### **Step 6: Deploy**
```bash
# Deploy
vercel --prod

# Add environment variables
vercel env add MONGODB_URI
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

---

## 🎯 **OPTION 2: DEPLOY TRÊN NETLIFY + RENDER**

### **Frontend (Netlify)**
```bash
# 1. Build frontend
npm run build

# 2. Deploy dist folder to Netlify
# https://netlify.com

# 3. Add redirect rules (_redirects)
/api/* https://your-render-app.herokuapp.com/api/:splat 200
```

### **Backend (Render)**
```bash
# 1. Tạo account Render
# https://render.com

# 2. Create Web Service
# - Runtime: Node
# - Build Command: npm install
# - Start Command: npm start

# 3. Add Environment Variables
# - MONGODB_URI
# - EMAIL_USER
# - EMAIL_PASS
```

---

## 🔧 **CẦN CẬP NHẬT TRƯỚC KHI DEPLOY**

### **1. Cập nhật server.js cho Vercel**
```javascript
// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'UniShop API is running' });
});

// Export for Vercel
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

### **2. Tạo api/index.js**
```javascript
// api/index.js
import app from '../server/server.js';
export default app;
```

### **3. Cập nhật API routes**
```javascript
// server/server.js
import authRoutes from './routes/authRoutes.js';
import shopRoutes from './routes/shopRoutes.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', shopRoutes);
```

---

## 📧 **CẤU HÌNH EMAIL CHO PRODUCTION**

### **Gmail App Password**
```bash
# 1. Bật 2-Step Verification
# 2. Tạo App Password
# 3. Dùng trong environment variables
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
```

---

## 🌐 **DOMAIN MIỄN PHÍ**

### **Vercel**
- Auto domain: `your-project.vercel.app`
- Custom domain: Free

### **Netlify**
- Auto domain: `your-project.netlify.app`
- Custom domain: Free

---

## 📋 **CHECKLIST TRƯỚC KHI DEPLOY**

### **Security** ✅
- [ ] Password hashing implemented
- [ ] Environment variables set
- [ ] CORS configured properly
- [ ] Rate limiting (optional)

### **Performance** ✅
- [ ] Images optimized
- [ ] Code minified
- [ ] Caching headers
- [ ] Bundle size optimized

### **Functionality** ✅
- [ ] All API endpoints working
- [ ] Database connection stable
- [ ] Email service working
- [ ] Error handling complete

---

## 🚀 **DEPLOY COMMANDS**

### **Vercel Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add MONGODB_URI production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
```

### **Netlify Deploy**
```bash
# Build
npm run build

# Deploy via drag-and-drop
# Upload dist folder to netlify.app
```

---

## 📞 **SUPPORT & MAINTENANCE**

### **Monitoring**
- Vercel Analytics (Free)
- MongoDB Atlas Monitoring
- Email logs

### **Backups**
- MongoDB Atlas automatic backups
- Code repository (GitHub)

### **Updates**
- `git push` → Auto deploy
- Environment variables update
- Database migrations

---

## 🎯 **RECOMMENDED SETUP**

### **For Production:**
```bash
# 1. MongoDB Atlas (Free)
# 2. Vercel (Frontend + API)
# 3. Gmail SMTP (Email)
# 4. Custom domain (Optional)
```

### **Cost:**
- **Vercel**: $0/month
- **MongoDB Atlas**: $0/month (512MB)
- **Gmail**: Free
- **Domain**: $0-$15/year (optional)

**Total: $0-15/year** 🎉

---

## 🚨 **IMPORTANT NOTES**

### **Free Tier Limitations:**
- **MongoDB**: 512MB storage
- **Vercel**: 100GB bandwidth/month
- **Email**: Gmail limits (500/day)

### **Scaling:**
- Easy upgrade to paid tiers
- No code changes needed
- Seamless migration

---

## 📞 **NEXT STEPS**

1. **Choose platform** (Vercel recommended)
2. **Setup MongoDB Atlas**
3. **Configure environment variables**
4. **Update code for serverless**
5. **Deploy and test**
6. **Setup custom domain** (optional)

**Ready to deploy! 🚀**
