
export type Language = 'en' | 'vi';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type UserRole = 'OWNER' | 'ACCOUNTANT' | 'STAFF';

// ... existing interfaces ...

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  discount: number;
  discountType: 'PERCENT' | 'FIXED';
  stock: number;
  sku: string;
  description: string;
  images: string[];
  isVisible: boolean;
  hasVariants: boolean;
  variants: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariantId?: string;
}

export interface Voucher {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number; // Percentage (0-100) or Amount
  minOrderValue: number;
  maxDiscount?: number; // Only for PERCENT type
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'ACTIVE' | 'DISABLED';
  createdBy?: string; // Employee ID
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  discountAmount: number; // Product discount + Voucher discount
  voucherCode?: string;
  voucherDiscount?: number; // Specific amount reduced by voucher
  pointsUsed?: number; // Loyalty points used
  pointsDiscount?: number; // Amount reduced by points
  shippingFee: number;
  shippingMethod: string;
  status: OrderStatus;
  paymentMethod: 'COD' | 'BANKING' | 'MOMO' | 'VNPAY';
  createdAt: string;
  updatedAt?: string;
  processedBy?: string; // Employee ID
  customerEmail?: string;
  taxAmount: number;
  taxRate: number;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  parentId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  address: string;
  status: 'ACTIVE' | 'LOCKED';
  joinedAt: string;
  loyaltyPoints: number; // New field
  wishlist: string[]; // List of Product IDs
}

export interface InventoryLog {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string; // e.g., "Red / L"
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number; // The amount changed (always positive in log, type determines sign)
  stockBefore: number;
  stockAfter: number;
  reason: string; // "Order #123", "Import PO-01", "Damaged"
  createdAt: string;
  performedBy?: string; // Employee ID
}

export interface FinanceAccount {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'WALLET';
  balance: number;
  accountNumber?: string;
}

export interface PaymentAccount {
    id: number;
    bank: string;
    number: string;
    holder: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string; // 'Sales', 'Cost of Goods', 'Salary', 'Rent', 'Other'
  description: string;
  date: string;
  accountId: string; // Links to FinanceAccount
  relatedId?: string; // Order ID or Inventory Log ID
  status: 'COMPLETED' | 'PENDING';
  createdBy?: string; // Employee ID
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  status: 'ACTIVE' | 'LOCKED';
  joinedAt: string;
  lastActive?: string;
  avatar?: string;
  level2Password?: string;
  level2PasswordAttempts?: number;
}

export interface ActivityLog {
  id: string;
  employeeId: string;
  employeeName: string;
  action: string; // e.g., "Confirmed Order #123", "Imported Stock"
  module: 'ORDER' | 'INVENTORY' | 'FINANCE' | 'SYSTEM' | 'VOUCHER';
  timestamp: string;
  details?: string;
}

export interface StoreSettings {
  shopInfo: { name: string; phone: string; address: string; email: string };
  paymentMethods: { cod: boolean; banking: boolean; momo: boolean };
  shipping: { standardFee: number; freeShipThreshold: number };
  inventory: { lowStockThreshold: number; showOutOfStock: boolean };
  orders: { autoConfirm: boolean; invoicePrefix: string };
  tax: { defaultRate: number };
  security: { enable2FA: boolean; passwordExpiry: number };
  notifications: { emailOnOrder: boolean; pushLowStock: boolean };
  staff: { allowDelete: boolean; maxDiscount: number };
}

export interface BackendState {
  products: Product[];
  orders: Order[];
  categories: Category[];
  customers: Customer[];
  inventoryLogs: InventoryLog[];
  financeAccounts: FinanceAccount[];
  paymentAccounts: PaymentAccount[];
  transactions: Transaction[];
  vouchers: Voucher[];
  employees: Employee[];
  activityLogs: ActivityLog[];
  settings: StoreSettings;
}

export interface BackendContextType {
  state: BackendState;
  // Auth
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (customerData: Omit<Customer, 'id' | 'joinedAt' | 'status' | 'loyaltyPoints' | 'wishlist'>) => void;
  getCurrentUser: () => Employee | Customer | null;
  // Product
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleWishlist: (customerId: string, productId: string) => void; // New Method
  // Order
  placeOrder: (
    customerInfo: { name: string; phone: string; address: string; email?: string },
    items: CartItem[],
    paymentMethod: Order['paymentMethod'],
    shippingInfo: { method: string, fee: number },
    voucherCode?: string,
    usePoints?: boolean // New Param
  ) => Order;
  updateOrderStatus: (id: string, status: OrderStatus, userId?: string) => void;
  // Category Methods
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // Customer Methods
  addCustomer: (customer: Omit<Customer, 'id' | 'joinedAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  updateCustomerStatus: (id: string, status: 'ACTIVE' | 'LOCKED') => void;
  // Inventory Methods
  adjustStock: (productId: string, variantId: string | undefined, quantity: number, type: 'IN' | 'OUT' | 'ADJUSTMENT', reason: string, userId?: string) => void;
  // Finance Methods
  addTransaction: (transaction: Omit<Transaction, 'id'>, userId?: string) => void;
  addPaymentAccount: (account: Omit<PaymentAccount, 'id'>) => void;
  deletePaymentAccount: (id: number) => void;
  // Voucher Methods
  addVoucher: (voucher: Omit<Voucher, 'id' | 'usedCount'>, userId?: string) => void;
  updateVoucher: (id: string, updates: Partial<Voucher>, userId?: string) => void;
  deleteVoucher: (id: string) => void;
  validateVoucher: (code: string, orderTotal: number) => { valid: boolean; discount: number; message?: string };
  // Employee Methods
  addEmployee: (employee: Omit<Employee, 'id' | 'joinedAt' | 'lastActive'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  setLevel2Password: (employeeId: string, newPassword: string) => void;
  disableLevel2Password: (employeeId: string) => void; // New method to turn off L2
  verifyLevel2Password: (employeeId: string, password: string) => { success: boolean; attemptsLeft: number };
  resetLevel2PasswordAttempts: (employeeId: string) => void;
  // System Methods
  updateSettings: (settings: Partial<StoreSettings>) => void;
  refresh: () => void;
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};
