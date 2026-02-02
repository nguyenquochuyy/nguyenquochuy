
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  category: String,
  price: Number,
  costPrice: Number,
  discount: Number,
  discountType: String,
  stock: Number,
  sku: String,
  description: String,
  images: [String],
  isVisible: Boolean,
  hasVariants: Boolean,
  variants: [{
    id: String,
    name: String,
    sku: String,
    price: Number,
    stock: Number
  }]
});

export const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  customerEmail: String,
  items: Array, // Stores CartItems snapshot
  total: Number,
  subtotal: Number,
  discountAmount: Number,
  voucherCode: String,
  voucherDiscount: Number,
  pointsUsed: Number,
  pointsDiscount: Number,
  shippingFee: Number,
  shippingMethod: String,
  status: String,
  paymentMethod: String,
  createdAt: String,
  updatedAt: String,
  processedBy: String,
  taxAmount: Number,
  taxRate: Number
});

export const Order = mongoose.model('Order', OrderSchema);

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  order: Number,
  parentId: String
});

export const Category = mongoose.model('Category', CategorySchema);

const CustomerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  email: String,
  password: { type: String }, // Should be hashed in production
  address: String,
  status: String,
  joinedAt: String,
  loyaltyPoints: { type: Number, default: 0 },
  wishlist: [String]
});

export const Customer = mongoose.model('Customer', CustomerSchema);

const EmployeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: String,
  status: String,
  joinedAt: String,
  lastActive: String,
  avatar: String,
  level2Password: String,
  level2PasswordAttempts: { type: Number, default: 0 }
});

export const Employee = mongoose.model('Employee', EmployeeSchema);

const InventoryLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productId: String,
  variantId: String,
  productName: String,
  variantName: String,
  type: String, // IN, OUT, ADJUSTMENT
  quantity: Number,
  stockBefore: Number,
  stockAfter: Number,
  reason: String,
  createdAt: String,
  performedBy: String
});

export const InventoryLog = mongoose.model('InventoryLog', InventoryLogSchema);

const FinanceAccountSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  type: String, // CASH, BANK, WALLET
  balance: Number,
  accountNumber: String
});

export const FinanceAccount = mongoose.model('FinanceAccount', FinanceAccountSchema);

const PaymentAccountSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  bank: String,
  number: String,
  holder: String
});

export const PaymentAccount = mongoose.model('PaymentAccount', PaymentAccountSchema);

const TransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: String, // INCOME, EXPENSE
  amount: Number,
  category: String,
  description: String,
  date: String,
  accountId: String,
  relatedId: String,
  status: String,
  createdBy: String
});

export const Transaction = mongoose.model('Transaction', TransactionSchema);

const VoucherSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  type: String, // PERCENT, FIXED
  value: Number,
  minOrderValue: Number,
  maxDiscount: Number,
  startDate: String,
  endDate: String,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  status: String,
  createdBy: String
});

export const Voucher = mongoose.model('Voucher', VoucherSchema);

const ActivityLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: String,
  employeeName: String,
  action: String,
  module: String,
  timestamp: String,
  details: String
});

export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

const SystemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
});

export const SystemSetting = mongoose.model('SystemSetting', SystemSettingSchema);

const VerificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: String,
  expiresAt: Date
});

export const VerificationCode = mongoose.model('VerificationCode', VerificationCodeSchema);
