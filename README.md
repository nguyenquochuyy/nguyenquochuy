# 🛍️ UniShop - E-Commerce Platform

<div align="center">
  <h1>UniShop</h1>
  <p>Modern e-commerce platform built with React, Node.js, and MongoDB</p>
  
  ![React](https://img.shields.io/badge/React-18.2.0-blue)
  ![Node.js](https://img.shields.io/badge/Node.js-18-green)
  ![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)
  ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)
</div>

## 🚀 Features

- ✅ **User Authentication** - Register, Login, Email Verification
- ✅ **Admin Panel** - Product Management, Order Management
- ✅ **Customer Portal** - Shopping Cart, Wishlist, Order History
- ✅ **Modern UI** - Responsive Design, Smooth Animations
- ✅ **Security** - Password Hashing, Account Lockout
- ✅ **Email Service** - Verification Codes, Notifications
- ✅ **Real-time Updates** - Live Cart, Order Status

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Analytics

### Backend
- **Node.js** - Runtime
- **Express.js** - API Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Nodemailer** - Email Service
- **bcrypt** - Password Hashing

### Deployment
- **Vercel** - Frontend & Serverless Functions
- **MongoDB Atlas** - Database Hosting

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Gmail account (for email service)

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/unishop.git
cd unishop
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment variables**
```bash
cp .env.example .env
# Edit .env with your values
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

## 🔧 Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/unishop

# Email Service
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
NODE_ENV=development
PORT=5000
```

## 📱 Usage

### Customer Flow
1. **Register** → Email Verification
2. **Login** → Browse Products
3. **Add to Cart** → Checkout
4. **Order History** → Track Orders

### Admin Flow
1. **Login** → Admin Panel
2. **Product Management** → Add/Edit Products
3. **Order Management** → Process Orders
4. **Analytics** → View Reports

## 🚀 Deployment

### Vercel (Recommended)

1. **Prepare for deployment**
```bash
npm run build
```

2. **Deploy to Vercel**
```bash
npm i -g vercel
vercel login
vercel --prod
```

3. **Set environment variables in Vercel Dashboard**
- `MONGODB_URI`
- `EMAIL_USER`
- `EMAIL_PASS`

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster (M0 Sandbox)
3. Create database user
4. Get connection string
5. Add to environment variables

## 📊 Project Structure

```
unishop/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── store/          # Store components
│   └── admin/          # Admin components
├── server/             # Backend server
│   ├── controllers/    # API controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── config/         # Server config
├── services/           # Utility services
├── hooks/              # Custom React hooks
├── types.ts            # TypeScript types
└── public/             # Static assets
```

## 🧪 Testing

### Test Credentials
```
Customer: test@example.com / 123456
Admin: admin@unishop.com / 123
```

### API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `GET /api/products` - Get products
- `POST /api/orders` - Create order

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ Email verification
- ✅ Account lockout protection
- ✅ Input validation
- ✅ CORS configuration
- ✅ Environment variable protection

## 📈 Performance

- ⚡ Lazy loading components
- ⚡ Optimized images
- ⚡ Code splitting
- ⚡ Caching strategies
- ⚡ Bundle optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: support@unishop.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/unishop/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/unishop/wiki)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Deployment Platform

---

<div align="center">
  <p>Made with ❤️ by UniShop Team</p>
  <p>⭐ Star this repo if it helped you!</p>
</div>
