
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  Product, Order, Category, Customer, Employee, 
  InventoryLog, FinanceAccount, PaymentAccount, 
  Transaction, Voucher, ActivityLog, SystemSetting,
  VerificationCode 
} from './models.js';
import { sendOrderConfirmation, sendStaffCredentials, sendWelcomeEmail, sendVerificationCode } from './emailService.js';

dotenv.config();

const app = express();

// Configure CORS to allow requests from any domain in production (or restrict to Vercel domain later)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// Use Environment Variables for Production
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unishop';

// Default settings if DB is empty
const DEFAULT_SETTINGS = {
  shopInfo: { name: 'UniShop', phone: '0901234567', address: '123 Le Loi, D1, HCMC', email: 'contact@unishop.com' },
  paymentMethods: { cod: true, banking: true, momo: false },
  shipping: { standardFee: 30000, freeShipThreshold: 500000 },
  inventory: { lowStockThreshold: 10, showOutOfStock: true },
  orders: { autoConfirm: false, invoicePrefix: 'INV-' },
  tax: { defaultRate: 10 },
  security: { enable2FA: false, passwordExpiry: 90 },
  notifications: { emailOnOrder: true, pushLowStock: false },
  staff: { allowDelete: false, maxDiscount: 20 }
};

// --- SEED DATA FUNCTION ---
const seedDatabase = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminExists = await Employee.findOne({ email: adminEmail });
    
    if (!adminExists) {
        await Employee.create({
            id: 'emp_admin_custom',
            name: 'Super Admin',
            email: adminEmail,
            password: '123456',
            role: 'OWNER',
            status: 'ACTIVE',
            joinedAt: new Date().toISOString(),
            level2Password: '123456',
            phone: '0900000000'
        });
        console.log(`✅ Admin account created: ${adminEmail} / 123456`);
    }
    
    // Seed Settings if not exist
    const settingsExist = await SystemSetting.findOne({ key: 'globalSettings' });
    if (!settingsExist) {
        await SystemSetting.create({ key: 'globalSettings', value: DEFAULT_SETTINGS });
        console.log('✅ Default settings initialized');
    }

  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedDatabase();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- API ENDPOINTS ---

app.get('/', (req, res) => {
    res.send('UniShop API is running');
});

app.get('/api/state', async (req, res) => {
  try {
    const [
      products, orders, categories, customers, employees,
      inventoryLogs, financeAccounts, paymentAccounts,
      transactions, vouchers, activityLogs, globalSettings
    ] = await Promise.all([
      Product.find(), Order.find(), Category.find(), Customer.find(), Employee.find(),
      InventoryLog.find(), FinanceAccount.find(), PaymentAccount.find(),
      Transaction.find(), Voucher.find(), ActivityLog.find(), 
      SystemSetting.findOne({ key: 'globalSettings' })
    ]);

    res.json({
      products, orders, categories, customers, employees,
      inventoryLogs, financeAccounts, paymentAccounts,
      transactions, vouchers, activityLogs,
      settings: globalSettings ? globalSettings.value : DEFAULT_SETTINGS
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

// Check if email exists
app.post('/api/auth/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const emp = await Employee.findOne({ email });
    const cust = await Customer.findOne({ email });
    if (emp || cust) {
      return res.json({ exists: true });
    }
    res.json({ exists: false });
  } catch (error) {
    res.status(500).json({ error: 'Check email failed' });
  }
});

// Send Verification Code (Random)
app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;
  
  // 1. Check uniqueness again just in case
  const emp = await Employee.findOne({ email });
  const cust = await Customer.findOne({ email });
  if (emp || cust) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng.' });
  }

  // 2. Generate Code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  // 3. Save to DB (Update if exists)
  await VerificationCode.findOneAndUpdate(
    { email },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  // 4. Send Email
  try {
    await sendVerificationCode(email, code);
    res.json({ success: true });
  } catch (error) {
    console.error("Email send fail", error);
    res.status(500).json({ success: false, message: "Không thể gửi email" });
  }
});

app.post('/api/auth/verify-code', async (req, res) => {
  const { email, code } = req.body;
  const record = await VerificationCode.findOne({ email });

  if (!record) {
    return res.json({ success: false, message: 'Mã không tồn tại hoặc đã hết hạn.' });
  }

  if (new Date() > record.expiresAt) {
    return res.json({ success: false, message: 'Mã đã hết hạn.' });
  }

  if (record.code !== code) {
    return res.json({ success: false, message: 'Mã xác thực không đúng.' });
  }

  // Clear code after success
  await VerificationCode.deleteOne({ email });
  res.json({ success: true });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const employee = await Employee.findOne({ email });
  if (employee && employee.password === password) {
    if (employee.status === 'LOCKED') return res.status(403).json({ message: 'Account locked' });
    await Employee.findByIdAndUpdate(employee._id, { lastActive: new Date().toISOString() });
    return res.json({ success: true, user: employee, role: employee.role });
  }
  const customer = await Customer.findOne({ email });
  if (customer && customer.password === password) {
    if (customer.status === 'LOCKED') return res.status(403).json({ message: 'Account locked' });
    return res.json({ success: true, user: customer, role: 'CUSTOMER' });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/products', async (req, res) => {
  const newProduct = new Product({ ...req.body, id: `p${Date.now()}` });
  await newProduct.save();
  if (newProduct.stock > 0 || newProduct.variants.length > 0) {
      const log = new InventoryLog({
          id: `log_${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          type: 'IN',
          quantity: newProduct.stock,
          stockBefore: 0,
          stockAfter: newProduct.stock,
          reason: 'Initial Import',
          createdAt: new Date().toISOString()
      });
      await log.save();
  }
  res.json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
  const updated = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/products/:id', async (req, res) => {
  await Product.findOneAndDelete({ id: req.params.id });
  res.json({ success: true });
});

app.post('/api/orders', async (req, res) => {
  const orderData = req.body;
  const newOrder = new Order({ ...orderData, id: `${Date.now()}`, createdAt: new Date().toISOString() });
  await newOrder.save();

  // Update Stock
  for (const item of orderData.items) {
      const product = await Product.findOne({ id: item.id });
      if (product) {
          if (item.selectedVariantId && product.hasVariants) {
              const variantIndex = product.variants.findIndex(v => v.id === item.selectedVariantId);
              if (variantIndex > -1) {
                  product.variants[variantIndex].stock -= item.quantity;
                  product.stock -= item.quantity; // Update total stock too
              }
          } else {
              product.stock -= item.quantity;
          }
          await product.save();
      }
  }

  // Update Points
  if (orderData.customerPhone) {
      const earnedPoints = Math.floor(orderData.total / 10000);
      const pointsUsed = orderData.pointsUsed || 0;
      await Customer.findOneAndUpdate(
          { phone: orderData.customerPhone },
          { $inc: { loyaltyPoints: earnedPoints - pointsUsed } }
      );
  }

  // Send Email (Async)
  sendOrderConfirmation(newOrder).catch(err => console.error("Email Error:", err));
  
  res.json(newOrder);
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { status, userId } = req.body;
  const order = await Order.findOneAndUpdate({ id: req.params.id }, { status, processedBy: userId }, { new: true });
  res.json(order);
});

app.post('/api/customers', async (req, res) => {
    // Check if email exists
    const { email } = req.body;
    if (email) {
        const exists = await Customer.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already exists' });
    }

    const cust = new Customer({ ...req.body, id: `cust_${Date.now()}`, joinedAt: new Date().toISOString() });
    await cust.save();
    sendWelcomeEmail(cust).catch(err => console.error("Email Error:", err));
    res.json(cust);
});

app.put('/api/customers/:id', async (req, res) => {
    const cust = await Customer.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(cust);
});

app.put('/api/customers/:id/wishlist', async (req, res) => {
    const { productId } = req.body;
    const customer = await Customer.findOne({ id: req.params.id });
    if(customer) {
        if(customer.wishlist.includes(productId)) {
            customer.wishlist = customer.wishlist.filter(id => id !== productId);
        } else {
            customer.wishlist.push(productId);
        }
        await customer.save();
    }
    res.json(customer);
});

app.post('/api/categories', async (req, res) => {
    const cat = new Category({ ...req.body, id: `c${Date.now()}` });
    await cat.save();
    res.json(cat);
});
app.put('/api/categories/:id', async (req, res) => {
    const cat = await Category.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(cat);
});
app.delete('/api/categories/:id', async (req, res) => {
    await Category.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
});

app.post('/api/inventory/adjust', async (req, res) => {
    const { productId, variantId, quantity, type, reason, userId } = req.body;
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let stockBefore = 0, stockAfter = 0;
    if (variantId && product.hasVariants) {
        const v = product.variants.find(v => v.id === variantId);
        if (v) {
            stockBefore = v.stock;
            v.stock = type === 'IN' ? v.stock + quantity : v.stock - quantity;
            stockAfter = v.stock;
            product.stock = product.variants.reduce((acc, curr) => acc + curr.stock, 0); // Recalculate total
        }
    } else {
        stockBefore = product.stock;
        product.stock = type === 'IN' ? product.stock + quantity : product.stock - quantity;
        stockAfter = product.stock;
    }
    await product.save();

    const log = new InventoryLog({
        id: `log_${Date.now()}`,
        productId, variantId,
        productName: product.name,
        variantName: variantId ? product.variants.find(v=>v.id===variantId)?.name : '',
        type, quantity, stockBefore, stockAfter, reason,
        createdAt: new Date().toISOString(),
        performedBy: userId
    });
    await log.save();
    res.json({ success: true });
});

app.post('/api/transactions', async (req, res) => {
    const tx = new Transaction({ ...req.body, id: `tx_${Date.now()}`, date: new Date().toISOString() });
    await tx.save();
    const adjustment = tx.type === 'INCOME' ? tx.amount : -tx.amount;
    await FinanceAccount.findOneAndUpdate({ id: tx.accountId }, { $inc: { balance: adjustment } });
    res.json(tx);
});

app.post('/api/vouchers', async (req, res) => {
    const voucher = new Voucher({ ...req.body, id: `v${Date.now()}` });
    await voucher.save();
    res.json(voucher);
});
app.put('/api/vouchers/:id', async (req, res) => {
    const v = await Voucher.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(v);
});
app.delete('/api/vouchers/:id', async (req, res) => {
    await Voucher.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
});

app.post('/api/employees', async (req, res) => {
    const empData = req.body;
    const emp = new Employee({ ...empData, id: `emp_${Date.now()}`, joinedAt: new Date().toISOString() });
    await emp.save();
    res.json(emp);
});
app.put('/api/employees/:id', async (req, res) => {
    const emp = await Employee.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(emp);
});

// Update global settings
app.post('/api/settings', async (req, res) => {
    const updates = req.body;
    
    let settingDoc = await SystemSetting.findOne({ key: 'globalSettings' });
    if (!settingDoc) {
        settingDoc = new SystemSetting({ key: 'globalSettings', value: DEFAULT_SETTINGS });
    }
    
    // Merge updates into current settings
    const currentSettings = settingDoc.value || DEFAULT_SETTINGS;
    const newSettings = { ...currentSettings, ...updates };
    
    settingDoc.value = newSettings;
    settingDoc.markModified('value'); // Required for Mixed type
    await settingDoc.save();
    
    res.json({ success: true, settings: newSettings });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
