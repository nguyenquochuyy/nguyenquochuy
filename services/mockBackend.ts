
import { Product, Order, OrderStatus, BackendState, Category, Customer, InventoryLog, FinanceAccount, Transaction, Voucher, Employee, ActivityLog, PaymentAccount, StoreSettings, Refund, ProductHistory, Review } from '../types';

// Changed version to force reset for loyalty features
const STORAGE_KEY = 'unishop_db_v18_auth_split';

// Dọn dẹp mạnh: Xóa rác local storage CŨ ngay lần chạy này
if (!sessionStorage.getItem('db_wiped_v2')) {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem('db_wiped_v2', 'true');
    console.log('🧹 Đã dọn dẹp TOÀN BỘ dữ liệu Mock thành TRỐNG TRƠN theo yêu cầu mới.');
}

const INITIAL_CATEGORIES: Category[] = [];

const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_001',
    name: 'Nguyễn Văn An',
    phone: '0901111111',
    email: 'an@gmail.com',
    password: 'Customer@123',
    address: '12 Lê Lợi, Q1, TP.HCM',
    status: 'ACTIVE',
    joinedAt: new Date().toISOString(),
    loyaltyPoints: 0,
    wishlist: []
  },
  {
    id: 'cust_002',
    name: 'Trần Thị Bình',
    phone: '0902222222',
    email: 'binh@gmail.com',
    password: 'Customer@123',
    address: '45 Nguyễn Huệ, Q1, TP.HCM',
    status: 'ACTIVE',
    joinedAt: new Date().toISOString(),
    loyaltyPoints: 150,
    wishlist: []
  }
];

const INITIAL_ACCOUNTS: FinanceAccount[] = [
  { id: 'acc1', name: 'Tiền mặt (Cash)', type: 'CASH', balance: 0 }
];

const INITIAL_PAYMENT_ACCOUNTS: PaymentAccount[] = [];

const INITIAL_VOUCHERS: Voucher[] = [];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_owner_001',
    name: 'Admin Owner',
    email: 'owner@unishop.com',
    password: 'Owner@2026',
    phone: '0900000001',
    role: 'OWNER',
    status: 'ACTIVE',
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    level2PasswordAttempts: 0
  },
  {
    id: 'emp_acc_001',
    name: 'Kế toán',
    email: 'accountant@unishop.com',
    password: 'Acc@2026',
    phone: '0900000002',
    role: 'ACCOUNTANT',
    status: 'ACTIVE',
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    level2PasswordAttempts: 0
  },
  {
    id: 'emp_staff_001',
    name: 'Nhân viên',
    email: 'staff@unishop.com',
    password: 'Staff@2026',
    phone: '0900000003',
    role: 'STAFF',
    status: 'ACTIVE',
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    level2PasswordAttempts: 0
  }
];

const INITIAL_LOGS: InventoryLog[] = [];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_REFUNDS: Refund[] = [];

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
    productHistory: [],
    reviews: [],
    refunds: INITIAL_REFUNDS,
    suppliers: [],
    purchaseOrders: [],
    warehouses: [],
    stockTakes: [],
    invoices: [],
    settings: DEFAULT_SETTINGS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  return initialState;
};

export const saveState = (state: BackendState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('⚠️ Cảnh báo: Bộ nhớ trình duyệt (localStorage) đã đầy. Hãy xóa bớt dữ liệu ảnh Base64 hoặc chuyển hoàn toàn sang dùng MongoDB.');
    } else {
      console.error('Lỗi khi lưu dữ liệu:', error);
    }
  }
};
