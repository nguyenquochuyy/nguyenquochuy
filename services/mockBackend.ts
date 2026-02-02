
import { Product, Order, OrderStatus, BackendState, Category, Customer, InventoryLog, FinanceAccount, Transaction, Voucher, Employee, ActivityLog, PaymentAccount, StoreSettings } from '../types';

// Changed version to force reset for loyalty features
const STORAGE_KEY = 'unishop_db_v17_settings_unified';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Apparel', order: 1 },
  { id: 'c2', name: 'Electronics', order: 2 },
  { id: 'c3', name: 'Home', order: 3 },
  { id: 'c4', name: 'Sports', order: 4 },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Áo Hoodie Neo-Tokyo',
    category: 'c1', // Apparel
    price: 890000,
    costPrice: 400000,
    discount: 0,
    discountType: 'PERCENT',
    stock: 50,
    sku: 'HOODIE-NT-001',
    description: 'Chiếc áo hoodie mang phong cách tương lai dành cho những nhà thám hiểm đô thị. Chất liệu vải thoáng khí và các điểm nhấn neon nổi bật.',
    images: ['https://picsum.photos/400/400?random=1', 'https://picsum.photos/400/400?random=11'],
    isVisible: true,
    hasVariants: true,
    variants: [
      { id: 'v1', name: 'Đen / M', sku: 'HOODIE-NT-BLK-M', price: 890000, stock: 30 },
      { id: 'v2', name: 'Đen / L', sku: 'HOODIE-NT-BLK-L', price: 890000, stock: 20 }
    ]
  },
  {
    id: 'p2',
    name: 'Tai Nghe Quantum Wireless',
    category: 'c2', // Electronics
    price: 3500000,
    costPrice: 1800000,
    discount: 10,
    discountType: 'PERCENT',
    stock: 25,
    sku: 'AUDIO-QBUDS',
    description: 'Trải nghiệm âm thanh chưa từng có với tính năng chống ồn chủ động và thời lượng pin 40 giờ.',
    images: ['https://picsum.photos/400/400?random=2'],
    isVisible: true,
    hasVariants: false,
    variants: []
  },
  {
    id: 'p3',
    name: 'Bình Gốm Minimalist',
    category: 'c3', // Home
    price: 450000,
    costPrice: 150000,
    discount: 0,
    discountType: 'FIXED',
    stock: 12,
    sku: 'HOME-VASE-01',
    description: 'Bình gốm thủ công với lớp men lì tinh tế. Hoàn hảo để cắm hoa khô trang trí.',
    images: ['https://picsum.photos/400/400?random=3'],
    isVisible: true,
    hasVariants: false,
    variants: []
  },
  {
    id: 'p4',
    name: 'Bàn Phím Cơ Cyberpunk',
    category: 'c2', // Electronics
    price: 4200000,
    costPrice: 2800000,
    discount: 500000,
    discountType: 'FIXED',
    stock: 8,
    sku: 'TECH-KEY-CP',
    description: 'Switch xúc giác với đèn nền RGB tùy chỉnh từng phím. Khung nhôm nguyên khối bền bỉ.',
    images: ['https://picsum.photos/400/400?random=4'],
    isVisible: false,
    hasVariants: false,
    variants: []
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust1',
    name: 'Nguyen Van A',
    phone: '0901234567',
    email: 'nguyenvana@gmail.com',
    password: 'password',
    address: '123 Le Loi, District 1, HCMC',
    status: 'ACTIVE',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    loyaltyPoints: 150,
    wishlist: ['p2']
  },
  {
    id: 'cust2',
    name: 'Tran Thi B',
    phone: '0909876543',
    email: 'tranthib@outlook.com',
    password: 'password',
    address: '456 Nguyen Hue, District 1, HCMC',
    status: 'ACTIVE',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    loyaltyPoints: 0,
    wishlist: []
  },
  {
    id: 'cust3',
    name: 'Le Van C',
    phone: '0912345678',
    email: 'levanc@company.vn',
    password: 'password',
    address: '789 Vo Van Kiet, District 5, HCMC',
    status: 'LOCKED',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    loyaltyPoints: 50,
    wishlist: []
  }
];

const INITIAL_ACCOUNTS: FinanceAccount[] = [
  { id: 'acc1', name: 'Tiền mặt (Cash)', type: 'CASH', balance: 5000000 },
  { id: 'acc2', name: 'Vietcombank', type: 'BANK', balance: 120000000, accountNumber: '0071000123456' },
  { id: 'acc3', name: 'Momo Wallet', type: 'WALLET', balance: 2500000 }
];

const INITIAL_PAYMENT_ACCOUNTS: PaymentAccount[] = [
    { id: 1, bank: 'Vietcombank', number: '0071000123456', holder: 'NGUYEN VAN A' },
    { id: 2, bank: 'MB Bank (QR)', number: '88889999', holder: 'UNI SHOP STORE' }
];

const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'WELCOME10',
    type: 'PERCENT',
    value: 10,
    minOrderValue: 0,
    maxDiscount: 100000,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    usageLimit: 1000,
    usedCount: 45,
    status: 'ACTIVE'
  },
  {
    id: 'v2',
    code: 'FREESHIP50',
    type: 'FIXED',
    value: 50000,
    minOrderValue: 500000,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    usageLimit: 100,
    usedCount: 98,
    status: 'ACTIVE'
  },
  {
    id: 'v3',
    code: 'FLASH20',
    type: 'PERCENT',
    value: 20,
    minOrderValue: 1000000,
    maxDiscount: 500000,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // Expired
    usageLimit: 50,
    usedCount: 50,
    status: 'ACTIVE'
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp0',
    name: 'Super Admin',
    email: 'admin@gmail.com',
    password: 'password',
    phone: '0900000000',
    role: 'OWNER',
    status: 'ACTIVE',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 730).toISOString(),
    lastActive: new Date().toISOString(),
    level2Password: 'admin',
    level2PasswordAttempts: 0
  },
  {
    id: 'emp1',
    name: 'Alice Nguyen',
    email: 'owner@unishop.com',
    password: 'password',
    phone: '0901111111',
    role: 'OWNER',
    status: 'ACTIVE',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
    lastActive: new Date().toISOString(),
    level2Password: '123456',
    level2PasswordAttempts: 0
  },
  {
    id: 'emp2',
    name: 'Bob Tran',
    email: 'accountant@unishop.com',
    password: 'password',
    phone: '0902222222',
    role: 'ACCOUNTANT',
    status: 'ACTIVE',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    level2PasswordAttempts: 0
  },
  {
    id: 'emp3',
    name: 'Charlie Le',
    email: 'staff@unishop.com',
    password: 'password',
    phone: '0903333333',
    role: 'STAFF',
    status: 'ACTIVE',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    level2PasswordAttempts: 0
  }
];

const INITIAL_LOGS: InventoryLog[] = INITIAL_PRODUCTS.flatMap(p => {
    if (p.hasVariants) {
        return p.variants.map(v => ({
            id: `log_${Math.random()}`,
            productId: p.id,
            variantId: v.id,
            productName: p.name,
            variantName: v.name,
            type: 'IN' as const,
            quantity: v.stock,
            stockBefore: 0,
            stockAfter: v.stock,
            reason: 'Initial Stock',
            createdAt: new Date().toISOString()
        }));
    } else {
        return [{
            id: `log_${Math.random()}`,
            productId: p.id,
            productName: p.name,
            type: 'IN' as const,
            quantity: p.stock,
            stockBefore: 0,
            stockAfter: p.stock,
            reason: 'Initial Stock',
            createdAt: new Date().toISOString()
        }];
    }
});

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'EXPENSE',
    amount: 5000000,
    category: 'Rent',
    description: 'Thanh toán tiền thuê mặt bằng T10',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    accountId: 'acc2',
    status: 'COMPLETED'
  },
  {
    id: 't2',
    type: 'INCOME',
    amount: 25000000,
    category: 'Sales',
    description: 'Doanh thu bán lẻ tuần 1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    accountId: 'acc1',
    status: 'COMPLETED'
  }
];

const DEFAULT_SETTINGS: StoreSettings = {
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

export const loadState = (): BackendState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Seed initial data
  const initialState: BackendState = {
    products: INITIAL_PRODUCTS,
    orders: [],
    categories: INITIAL_CATEGORIES,
    customers: INITIAL_CUSTOMERS,
    inventoryLogs: INITIAL_LOGS,
    financeAccounts: INITIAL_ACCOUNTS,
    paymentAccounts: INITIAL_PAYMENT_ACCOUNTS,
    transactions: INITIAL_TRANSACTIONS,
    vouchers: INITIAL_VOUCHERS,
    employees: INITIAL_EMPLOYEES,
    activityLogs: [],
    settings: DEFAULT_SETTINGS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  return initialState;
};

export const saveState = (state: BackendState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
